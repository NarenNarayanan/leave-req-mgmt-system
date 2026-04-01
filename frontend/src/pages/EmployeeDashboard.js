import { useState, useEffect, useCallback } from 'react';
import { leaveAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import styles from './Dashboard.module.css';

const TYPES = ['sick', 'casual', 'earned', 'unpaid'];
const defaultForm = { leaveType: 'sick', startDate: '', endDate: '', reason: '' };

export default function EmployeeDashboard() {
  const [leaves,  setLeaves]  = useState([]);
  const [form,    setForm]    = useState(defaultForm);
  const [msg,     setMsg]     = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [filter,  setFilter]  = useState('');

  const fetchLeaves = useCallback(async () => {
    try {
      const { data } = await leaveAPI.getMyLeaves(filter ? { status: filter } : {});
      setLeaves(data.data.leaves);
    } catch {}
  }, [filter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg({ text: '', type: '' }); setLoading(true);
    try {
      await leaveAPI.apply(form);
      setMsg({ text: 'Leave application submitted!', type: 'success' });
      setForm(defaultForm);
      fetchLeaves();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to apply', type: 'error' });
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Employee Dashboard</h2>

      <section className={styles.card}>
        <h3 className={styles.sectionTitle}>Apply for Leave</h3>
        {msg.text && <p className={msg.type === 'success' ? styles.success : styles.error} style={{marginBottom:'0.75rem'}}>{msg.text}</p>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Leave Type</label>
              <select value={form.leaveType} onChange={set('leaveType')}>
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={set('startDate')} required />
            </div>
            <div className={styles.field}>
              <label>End Date</label>
              <input type="date" value={form.endDate} onChange={set('endDate')} required />
            </div>
          </div>
          <div className={styles.field}>
            <label>Reason</label>
            <textarea value={form.reason} onChange={set('reason')} rows={3} required minLength={10} placeholder="Describe your reason (min 10 chars)" />
          </div>
          <button className={styles.btn} disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
        </form>
      </section>

      <section className={styles.card}>
        <div className={styles.tableHeader}>
          <h3 className={styles.sectionTitle}>My Leave Requests</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)} className={styles.filterSelect}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {leaves.length === 0 ? <p className={styles.empty}>No leave requests found.</p> : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Comment</th></tr></thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l._id}>
                    <td style={{textTransform:'capitalize'}}>{l.leaveType}</td>
                    <td>{new Date(l.startDate).toLocaleDateString()}</td>
                    <td>{new Date(l.endDate).toLocaleDateString()}</td>
                    <td>{l.totalDays}</td>
                    <td className={styles.reasonCell}>{l.reason}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>{l.adminComment || '—'}</td>
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
