import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

const useAutoLogout = () => {
  const { backendUrl, setIsLoggedIn, setUserData } = useAppContext();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Optional: Fetch CSRF token if your backend enforces CSRF protection
  const fetchCsrfToken = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/csrf-token`, {
        withCredentials: true
      });
      return res.data.csrfToken;
    } catch (err) {
      console.error('Failed to fetch CSRF token');
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      const csrfToken = await fetchCsrfToken();
      await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: csrfToken ? { 'CSRF-Token': csrfToken } : {},
        }
      );
    } catch (err) {
      console.error('Logout failed silently', err);
    }

    console.log('Auto logout triggered at', new Date().toLocaleTimeString());
    toast.info('You were logged out due to inactivity');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/login');
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // Start the inactivity timer on mount

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
};

export default useAutoLogout;
