export default function Spinner({ text = 'Loading...' }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', flexDirection:'column', gap:'0.75rem', color:'#64748b' }}>
      <div style={{ width:36, height:36, border:'4px solid #e2e8f0', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ fontSize:'0.9rem' }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
