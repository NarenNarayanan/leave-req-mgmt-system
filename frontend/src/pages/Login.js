import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Sign In</h2>
        {error && <p className={styles.error}>{error}</p>}
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <label className={styles.label}>Password</label>
        <input className={styles.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
        <button className={styles.btn} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        <p className={styles.link}>No account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
