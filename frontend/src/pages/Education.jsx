import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useView } from '../view.js'
import { Card, Skeleton, Spinner, ErrorNote } from '../components/ui.jsx'

const ROLES = ['Nurse', 'ASHA Worker', 'Medical Officer', 'Pharmacist', 'Nodal Officer', 'Volunteer']
const TOPICS = ['Handling Shortages', 'Pandemic Preparedness', 'Heatwave Response', 'Mass-gathering Triage', 'Cold-chain Management']
const PROGRESS_KEY = 'swasthya.edu'
const XP_PER_LEVEL = 5

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || { xp: 0 }
  } catch {
    return { xp: 0 }
  }
}

// Upskilling: /education/generate returns modules whose `questions` render as
// multiple-choice simulations with a "Why?" rationale.
export default function Education() {
  const { report } = useView()
  const [topic, setTopic] = useState(TOPICS[0])
  const [role, setRole] = useState(ROLES[0])
  const [modules, setModules] = useState(null)
  const [state, setState] = useState('idle')
  const [err, setErr] = useState('')
  const [mi, setMi] = useState(0)
  const [qi, setQi] = useState(0)
  const [answers, setAnswers] = useState({})
  const [whyOpen, setWhyOpen] = useState(false)
  const [progress, setProgress] = useState(readProgress)

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
    } catch {
      /* ignore */
    }
  }, [progress])

  // A topic tailored to the current region's top risk.
  const regional = report?.compound_risks?.[0]?.scenario || report?.signal_assessment?.outbreak_alerts?.[0]?.signal
  const topics = regional ? [regional.slice(0, 60), ...TOPICS] : TOPICS

  const generate = async (t = topic) => {
    setState('loading')
    setErr('')
    try {
      const res = await api.post('/api/v1/education/generate', { query: t, user_role: role })
      setModules(res?.modules || [])
      setMi(0)
      setQi(0)
      setAnswers({})
      setWhyOpen(false)
      setState('done')
    } catch (e) {
      setErr(e.message || 'Could not generate a module')
      setState('error')
    }
  }

  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1
  const pct = ((progress.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100
  const mod = modules?.[mi]
  const qs = mod?.questions || []
  const question = qs[qi]
  const key = `${mi}-${qi}`
  const picked = answers[key]
  const answered = picked != null
  const correct = answered && picked === question?.correct_option_index

  const choose = (i) => {
    if (answered) return
    setAnswers((a) => ({ ...a, [key]: i }))
    setWhyOpen(true)
    if (i === question.correct_option_index) setProgress((p) => ({ ...p, xp: p.xp + 1 }))
  }
  const next = () => {
    setWhyOpen(false)
    if (qi < qs.length - 1) setQi(qi + 1)
    else if (mi < modules.length - 1) {
      setMi(mi + 1)
      setQi(0)
    } else setQi(qs.length)
  }
  const score = qs.filter((q, i) => answers[`${mi}-${i}`] === q.correct_option_index).length

  return (
    <div className="px-7 pt-3 max-w-[1100px]">
      {/* Progress header */}
      <div className="rise rounded-[28px] p-6 mb-5 text-white relative overflow-hidden shadow-[0_16px_40px_rgba(20,150,140,0.25)]" style={{ background: 'linear-gradient(120deg,#0E7F77 0%,#1FA592 55%,#6FD8C9 100%)' }}>
        <div className="absolute -right-10 -top-16 w-60 h-60 rounded-full bg-white/10" />
        <div className="absolute right-24 -bottom-20 w-44 h-44 rounded-full bg-white/[0.06]" />
        <div className="relative">
          <div className="text-[11px] font-semibold tracking-[0.12em] text-white/70">EDUCATION &amp; SIMULATION</div>
          <div className="font-display text-[22px] font-bold mt-1">
            Level {level}: {mod?.title || topic}
          </div>
          <div className="flex items-center gap-3 mt-4 max-w-[520px]">
            <div className="flex-1 h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[12px] font-semibold tabular-nums">
              {progress.xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP
            </span>
          </div>
        </div>
      </div>

      {/* Generator */}
      <Card i={1} className="p-5 mb-5">
        <div className="flex gap-3 items-end flex-wrap">
          <label className="flex-1 min-w-[260px]">
            <div className="text-[11px] font-semibold text-muted mb-1.5">Training topic</div>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              className="w-full h-11 px-4 rounded-2xl glass-inset text-[14px] outline-none focus:ring-4 focus:ring-brand/15"
            />
          </label>
          <label>
            <div className="text-[11px] font-semibold text-muted mb-1.5">Your role</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-11 px-3 rounded-2xl glass-inset text-[14px] outline-none focus:ring-4 focus:ring-brand/15"
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => generate()}
            disabled={state === 'loading' || !topic.trim()}
            className="lm lm-primary h-11 px-6 rounded-2xl text-[13px] font-bold cursor-pointer flex items-center gap-2"
          >
            {state === 'loading' && <Spinner size={13} className="!border-white/40 !border-t-white" />}
            Generate module
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {topics.map((t, i) => (
            <button
              key={t}
              onClick={() => {
                setTopic(t)
                generate(t)
              }}
              className="h-8 px-3.5 rounded-full text-[12px] glass-inset text-body hover:bg-white hover:text-brand transition-all duration-300"
            >
              {i === 0 && regional ? '📍 ' : ''}
              {t}
            </button>
          ))}
        </div>
      </Card>

      {state === 'loading' && (
        <Card i={2} className="p-6">
          <Skeleton className="h-5 w-1/3 mb-3" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </Card>
      )}
      {state === 'error' && (
        <Card i={3}>
          <ErrorNote title="Education service unavailable" message={err} onRetry={() => generate()} />
        </Card>
      )}
      {state === 'idle' && (
        <Card i={4} className="p-10 text-center">
          <div className="text-[34px] mb-2">🎓</div>
          <div className="text-[15px] font-semibold">Pick a topic to start a simulation</div>
          <div className="text-[13px] text-muted mt-1">Modules are generated for your role and scored as you go.</div>
        </Card>
      )}

      {state === 'done' && mod && (
        <div className="grid gap-5" style={{ gridTemplateColumns: modules.length > 1 ? '240px minmax(0,1fr)' : 'minmax(0,1fr)' }}>
          {modules.length > 1 && (
            <div className="flex flex-col gap-2">
              {modules.map((m, i) => (
                <button
                  key={m.module_id || i}
                  onClick={() => {
                    setMi(i)
                    setQi(0)
                    setWhyOpen(false)
                  }}
                  className={`text-left rounded-2xl p-3.5 border transition-colors ${i === mi ? 'border-white bg-white/90 shadow-[0_8px_20px_rgba(20,40,38,0.1)]' : 'border-transparent glass-inset hover:bg-white/70'}`}
                >
                  <div className="text-[13px] font-semibold">{m.title}</div>
                  <div className="text-[11px] text-faint mt-0.5">{m.questions?.length || 0} questions</div>
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="mb-4">
              <div className="text-[18px] font-bold tracking-[-0.01em]">{mod.title}</div>
              <div className="text-[13px] text-muted mt-1 leading-relaxed">{mod.description}</div>
              <div className="text-[11px] text-faint mt-1">For: {mod.target_audience}</div>
            </div>

            {question ? (
              <div key={`${mi}-${qi}`} className="slide-next glass-strong rounded-[28px] p-6" style={{ background: 'linear-gradient(145deg,rgba(232,246,243,0.85) 0%,rgba(255,255,255,0.8) 55%,rgba(240,247,245,0.8) 100%)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold tracking-[0.08em] text-brand uppercase">
                    Scenario {qi + 1} of {qs.length}
                  </span>
                  <div className="flex gap-1">
                    {qs.map((_, i) => (
                      <span key={i} className={`h-1.5 rounded-full transition-all ${i === qi ? 'w-6 bg-brand' : i < qi ? 'w-3 bg-brand/50' : 'w-3 bg-black/10'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-[17px] font-semibold leading-snug mb-5">{question.question_text}</div>
                <div className="flex flex-col gap-2.5">
                  {(question.options || []).map((o, i) => {
                    const isRight = i === question.correct_option_index
                    const isPicked = i === picked
                    const style = !answered
                      ? 'bg-white/80 border-white hover:border-brand/40 hover:shadow-[0_8px_20px_rgba(20,40,38,0.1)] hover:-translate-y-px'
                      : isRight
                        ? 'bg-[#E8F5EC] border-[#34A56A] text-[#1F5C39]'
                        : isPicked
                          ? 'bg-[#FDECEC] border-[#EF4444] text-[#991B1B]'
                          : 'bg-white/40 border-transparent text-faint'
                    return (
                      <button
                        key={i}
                        onClick={() => choose(i)}
                        disabled={answered}
                        className={`flex items-center gap-3 text-left px-4 py-3.5 rounded-2xl border-2 transition-all text-[14px] ${style}`}
                      >
                        <span className="w-7 h-7 rounded-full border border-current/20 bg-white/70 flex items-center justify-center text-[12px] font-bold flex-none">
                          {answered && isRight ? '✓' : answered && isPicked ? '✕' : String.fromCharCode(65 + i)}
                        </span>
                        {o}
                      </button>
                    )
                  })}
                </div>

                {answered && (
                  <div className="mt-5 rounded-2xl glass-inset overflow-hidden rise">
                    <button onClick={() => setWhyOpen((w) => !w)} className="w-full flex items-center justify-between px-4 py-3 text-[13px] font-semibold">
                      <span className={correct ? 'text-brand' : 'text-danger'}>{correct ? 'Correct! ' : 'Not quite. '}<span className="text-ink">Why?</span></span>
                      <span className={`text-faint transition-transform ${whyOpen ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    {whyOpen && (
                      <div className="px-4 pb-4 text-[13px] text-body leading-relaxed">
                        {question.explanation || 'No rationale provided for this scenario.'}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end mt-5">
                  <button onClick={next} disabled={!answered} className="lm lm-primary h-10 px-5 rounded-full text-[13px] font-bold cursor-pointer">
                    {qi < qs.length - 1 || mi < modules.length - 1 ? 'Next scenario →' : 'Finish'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rise glass-strong rounded-[28px] p-8 text-center">
                <div className="text-[34px]">🏅</div>
                <div className="text-[17px] font-bold mt-1">Module complete</div>
                <div className="text-[13px] text-muted mt-1">
                  You scored {score} / {qs.length}
                </div>
                <button
                  onClick={() => {
                    setQi(0)
                    setAnswers({})
                  }}
                  className="lm lm-light h-9 px-4 rounded-full text-[12px] font-semibold mt-4 cursor-pointer"
                >
                  Retry module
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {state === 'done' && !mod && (
        <Card i={5}>
          <ErrorNote title="No modules returned" message="Try a different topic." />
        </Card>
      )}
    </div>
  )
}
