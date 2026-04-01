const colors = {
  pending:  { background:'#fef9c3', color:'#854d0e' },
  approved: { background:'#dcfce7', color:'#166534' },
  rejected: { background:'#fee2e2', color:'#991b1b' },
};
export default function StatusBadge({ status }) {
  return (
    <span style={{ ...colors[status], padding:'2px 10px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:600, textTransform:'capitalize', display:'inline-block' }}>
      {status}
    </span>
  );
}
