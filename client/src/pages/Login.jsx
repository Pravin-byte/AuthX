import '../App.css';
import { FaUser, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

function Login() {
  const [user, setUser] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const { setIsLoggedIn, backendUrl } = useAppContext();
  const navigate = useNavigate();

  // 🛡️ Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/csrf-token`, {
          withCredentials: true,
        });
        setCsrfToken(res.data.csrfToken);
      } catch (err) {
        toast.error('Failed to get CSRF token');
      }
    };
    fetchCsrf();
  }, [backendUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/login`,
        user,
        {
          headers: {
            'csrf-token': csrfToken, // 🛡️ Send token in header
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setIsLoggedIn(true);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else if (res.data.requiresVerification) {
        toast.info(res.data.message);
        localStorage.setItem('registerEmail', user.email);
        navigate('/verify');
      } else {
        toast.error(res.data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <div className="input-group">
          <input
            type="email"
            id="email"
            name="email"
            placeholder=" "
            className="inputField"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
          <label htmlFor="email" className="input-label">
            <FaUser /> Email
          </label>
        </div>

        <div className="input-group">
          <input
            type="password"
            id="password"
            name="password"
            placeholder=" "
            className="inputField"
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            required
            minLength="6"
          />
          <label htmlFor="password" className="input-label">
            <FaLock /> Password
          </label>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="auth-options">
          <Link to="/change-password">
            <button type="button" className="auth-link">Forgot Password?</button>
          </Link>
          <Link to="/register">
            <button type="button" className="auth-link">Don't have an Account?</button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
