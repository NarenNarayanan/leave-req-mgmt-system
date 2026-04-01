import { useState, useEffect, useCallback } from 'react';
import { leaveAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
  const [leaves,  setLeaves]  = useState([]);
  const [filter,  setFilter]  = useState('');
  const [comment, setComment] = useState({});
  const [msg,     setMsg]     = useState({ id: null, text: '', type: '' });

  const fetchLeaves = useCallback(async () => {
    try {
      const { data } = await leaveAPI.getAllLeaves(filter ? { status: filter } : {});
      setLeaves(data.data.leaves);
    } catch {}
  }, [filter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleAction = async (id, status) => {
    setMsg({ id, text: '', type: '' });
    try {
      await leaveAPI.updateStatus(id, { status, adminComment: comment[id] || '' });
      setMsg({ id, text: `Leave ${status}`, type: 'success' });
      fetchLeaves();
    } catch (err) {
      setMsg({ id, text: err.response?.data?.message || 'Action failed', type: 'error' });
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Admin Dashboard</h2>
      <section className={styles.card}>
        <div className={styles.tableHeader}>
          <h3 className={styles.sectionTitle}>All Leave Requests</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)} className={styles.filterSelect}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {leaves.length === 0 ? <p className={styles.empty}>No requests found.</p> : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Comment</th><th>Action</th></tr></thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l._id}>
                    <td><strong>{l.user?.name}</strong><br /><small style={{color:'#64748b'}}>{l.user?.email}</small></td>
                    <td style={{textTransform:'capitalize'}}>{l.leaveType}</td>
                    <td>{new Date(l.startDate).toLocaleDateString()}</td>
                    <td>{new Date(l.endDate).toLocaleDateString()}</td>
                    <td>{l.totalDays}</td>
                    <td className={styles.reasonCell}>{l.reason}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>
                      {l.status === 'pending'
                        ? <input type="text" placeholder="Optional comment" value={comment[l._id]||''} onChange={e => setComment({...comment,[l._id]:e.target.value})} className={styles.commentInput} />
                        : <span>{l.adminComment||'—'}</span>}
                    </td>
                    <td>
                      {l.status === 'pending' ? (
                        <div className={styles.actionBtns}>
                          <button className={styles.approveBtn} onClick={() => handleAction(l._id,'approved')}>✓ Approve</button>
                          <button className={styles.rejectBtn}  onClick={() => handleAction(l._id,'rejected')}>✗ Reject</button>
                          {msg.id === l._id && <small className={msg.type==='success'?styles.success:styles.error}>{msg.text}</small>}
                        </div>
                      ) : <span style={{fontSize:'0.8rem',color:'#94a3b8'}}>Reviewed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
