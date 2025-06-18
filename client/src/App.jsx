import './App.css';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route, Navigate ,Link} from 'react-router-dom';
import Login from "./pages/Login";
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import { AppContextProvider ,useAppContext } from './context/AppContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Link to="/">
          <div className="authx-floating-logo">Auth<span>X</span></div>
        </Link>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/change-password' element={<ChangePassword />} />
          <Route path="/verify" element={<Verify />} />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
        />

      </BrowserRouter>
    </AppContextProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAppContext();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default App;