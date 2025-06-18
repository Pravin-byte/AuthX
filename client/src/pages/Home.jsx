import '../App.css';
import { Link } from 'react-router-dom';
import verifyUserPng from "../assets/user.gif";
import loginUserPng from "../assets/login-.gif";
import createUserPng from "../assets/add-friend.gif";
  
function Home() {

  return (
    <div className="home">
      <div className='head'>
        <h1 className="welcome-msg">Welcome to AuthX!</h1>
        <p>
          AuthX is your secure gateway to modern authentication. Sign up, log in, and manage your digital identity with ease and confidence.
        </p>
      </div>

      <Link to='/login'>
        <button className="getStarted-btn">
          Get Started
          <span className="login-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="22"
              viewBox="0 -4 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </span>
        </button>
      </Link>

      <ol className="steps-list">
        <li>
          <div>
            <img src={createUserPng} alt="Create Account" />
            <p>Create your account with just name, email and password.</p>
          </div>
        </li>
        <li>
          <div>
            <img src={verifyUserPng} alt="Verify" />
            <p>Verify your email to activate your profile.</p>
          </div>
        </li>
        <li>
          <div>
            <img src={loginUserPng} alt="Login" />
            <p>Log in and enjoy secure, personalized access to your dashboard.</p>
          </div>
        </li>
      </ol>
    </div>
  );
}

export default Home;
