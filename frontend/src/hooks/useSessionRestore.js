import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * On first load, silently validates the stored JWT with GET /auth/me.
 * If the token is expired/invalid, clears localStorage and forces re-login.
 */
export default function useSessionRestore() {
  const { logout }        = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setReady(true); return; }

    authAPI.me()
      .then(() => setReady(true))
      .catch(() => { logout(); setReady(true); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ready;
}
