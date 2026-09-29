// Minimal, safe Markdown renderer for chat replies: headings, paragraphs,
// bullet/numbered lists, tables, **bold**, *italic* and `code`. Builds React
// elements only — model output is never injected as HTML.

function inline(text, key = 'i') {
  const out = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g
  let last = 0
  let m
  let n = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const t = m[0]
    const k = `${key}-${n++}`
    if (t.startsWith('**')) out.push(<strong key={k}>{t.slice(2, -2)}</strong>)
    else if (t.startsWith('`')) out.push(<code key={k}>{t.slice(1, -1)}</code>)
    else out.push(<em key={k}>{t.slice(1, -1)}</em>)
    last = m.index + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

const cells = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())

export default function Markdown({ text }) {
  const lines = String(text || '').replace(/\r/g, '').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    const h = line.match(/^#{1,6}\s+(.*)/)
    if (h) {
      blocks.push(<h3 key={i}>{inline(h[1], 'h' + i)}</h3>)
      i++
      continue
    }
    if (/^\s*\|/.test(line) && lines[i + 1] && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = cells(line)
      const body = []
      i += 2
      while (i < lines.length && /^\s*\|/.test(lines[i])) body.push(cells(lines[i++]))
      blocks.push(
        <div key={'t' + i} className="overflow-x-auto">
          <table>
            <thead>
              <tr>{head.map((c, j) => <th key={j}>{inline(c, `th${i}${j}`)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c, `td${i}${ri}${j}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }
    const listRe = /^\s*([-*•]|\d+[.)])\s+(.*)/
    if (listRe.test(line)) {
      const ordered = /^\s*\d/.test(line)
      const items = []
      while (i < lines.length && listRe.test(lines[i])) items.push(lines[i++].match(listRe)[2])
      const Tag = ordered ? 'ol' : 'ul'
      blocks.push(
        <Tag key={'l' + i}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, `li${i}${j}`)}</li>
          ))}
        </Tag>,
      )
      continue
    }
    const para = []
    while (i < lines.length && lines[i].trim() && !listRe.test(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && !/^\s*\|/.test(lines[i])) {
      para.push(lines[i++])
    }
    blocks.push(<p key={'p' + i}>{inline(para.join(' '), 'p' + i)}</p>)
  }
  return <div className="md">{blocks}</div>
}
