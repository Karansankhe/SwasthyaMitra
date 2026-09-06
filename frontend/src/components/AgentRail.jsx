import { useDashboard } from '../dashboard.jsx'
import { useStore } from '../store.jsx'
import { btnPrimary, btnGhost, Empty } from './ui.jsx'

// Right rail: the recommended actions produced by the /analyze report,
// with human-in-the-loop approve/dismiss.
export default function AgentRail() {
  const { actions } = useDashboard()
  const { resolved, approve, dismiss } = useStore()
  const list = actions || []
  const pending = list.filter((_, i) => !resolved['ra' + i]).length

  return (
    <aside className="w-[340px] flex-none border-l border-black/[0.08] bg-panel flex flex-col">
      <div className="px-[18px] pt-4 pb-3.5 border-b border-black/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-[7px] h-[7px] rounded-full bg-brand" style={{ boxShadow: '0 0 8px #F2785C' }} />
          <div className="text-[13px] font-semibold">Recommended Actions</div>
        </div>
        <div className="text-[11px] text-muted mt-1">
          {list.length ? `${pending} of ${list.length} awaiting your approval` : 'Generated from the latest analysis'}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3.5">
        {list.length === 0 && <Empty>No recommended actions yet.</Empty>}
        {list.map((a, i) => {
          const id = 'ra' + i
          const state = resolved[id]
          return (
            <div key={id} className="border border-black/[0.08] bg-white rounded-[10px] p-3 mb-2.5">
              <div className="flex items-center gap-2 mb-[7px]">
                <span className="text-[10px] font-semibold text-brand bg-brand/[0.12] rounded-[5px] px-[7px] py-0.5">{a.tag}</span>
              </div>
              <div className="text-xs leading-relaxed text-body">{a.text}</div>
              {state ? (
                <div className="mt-[9px] text-[11px] font-semibold" style={{ color: state === 'approved' ? '#1C2220' : '#5C665F' }}>
                  {state === 'approved' ? '✓ Approved · executing' : '✕ Dismissed'}
                </div>
              ) : (
                <div className="flex gap-2 mt-[11px]">
                  <button className={`${btnPrimary} flex-1`} onClick={() => approve(id)}>Approve</button>
                  <button className={`${btnGhost} flex-1`} onClick={() => dismiss(id)}>Dismiss</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
