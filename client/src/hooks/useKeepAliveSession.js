import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const useKeepAliveSession = () => {
  const { backendUrl } = useAppContext();
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const [csrfToken, setCsrfToken] = useState(null);

  // Fetch CSRF token when hook mounts
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/csrf-token`, {
          withCredentials: true,
        });
        setCsrfToken(res.data.csrfToken);
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
      }
    };

    fetchCsrfToken();
  }, [backendUrl]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, updateActivity));

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
    };
  }, []);

  // Periodically ping server with CSRF token
  useEffect(() => {
    const pingServer = async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      if (timeSinceLastActivity < 8 * 60 * 1000 && csrfToken) {
        try {
          await axios.get(`${backendUrl}/api/user/data`, {
            withCredentials: true,
            headers: {
              'X-CSRF-Token': csrfToken,
            },
          });
        } catch (error) {
          console.error('Session ping failed', error);
        }
      }
    };

    intervalRef.current = setInterval(pingServer, 5 * 60 * 1000); // every 5 min

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [csrfToken, backendUrl]);
};

export default useKeepAliveSession;
