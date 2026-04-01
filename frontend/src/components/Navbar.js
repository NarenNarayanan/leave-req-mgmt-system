import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>🗓 Leave Manager</span>
      {user && (
        <div className={styles.right}>
          <span className={styles.info}>{user.name} · <span className={styles.role}>{user.role}</span></span>
          <button className={styles.btn} onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
