import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'employee' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Create Account</h2>
        {error && <p className={styles.error}>{error}</p>}
        <label className={styles.label}>Full Name</label>
        <input className={styles.input} type="text" value={form.name} onChange={set('name')} required />
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" value={form.email} onChange={set('email')} required />
        <label className={styles.label}>Password</label>
        <input className={styles.input} type="password" value={form.password} onChange={set('password')} required />
        <label className={styles.label}>Role</label>
        <select className={styles.input} value={form.role} onChange={set('role')}>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <button className={styles.btn} disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <p className={styles.link}>Have an account? <Link to="/login">Sign In</Link></p>
      </form>
    </div>
  );
}
