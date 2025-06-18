import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import useAutoLogout from '../hooks/useAutoLogout';
import useKeepAliveSession from '../hooks/useKeepAliveSession';

function Dashboard() {
  const { userData, backendUrl, setIsLoggedIn, setUserData } = useAppContext();
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useAutoLogout();
  useKeepAliveSession();

  // 1. Get CSRF Token on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/csrf-token`, {
          withCredentials: true,
        });
        setCsrfToken(res.data.csrfToken);
      } catch (err) {
        toast.error('CSRF token fetch failed');
      }
    };
    fetchCsrf();
  }, [backendUrl]);

  // 2. Handle page unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 3. Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/data`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setUserData(res.data.userData);
        } else {
          toast.error(res.data.message || 'Unauthorized');
          navigate('/login');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch user data');
        navigate('/login');
      }
    };

    fetchUserData();
  }, []);

  // 4. Handle Logout with CSRF Token
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.post(
          `${backendUrl}/api/auth/logout`,
          {},
          {
            headers: { 'CSRF-Token': csrfToken },
            withCredentials: true,
          }
        );

        if (res.data.success) {
          toast.success('Logout successful!');
          setIsLoggedIn(false);
          setUserData(null);
          navigate('/login');
        } else {
          toast.error('Logout failed. Please try again.');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Logout failed.');
      }
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="logout-button-container">
        <button onClick={handleLogout} className="auth-btn logout-btn">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h1>Hello, {userData?.name} 👋</h1>
        <p>Email: <strong>{userData?.email}</strong></p>
        <p>
          Account Status:{' '}
          <span className={userData?.isAccountVerified ? 'status verified' : 'status not-verified'}>
            {userData?.isAccountVerified ? 'Verified' : 'Not Verified'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
