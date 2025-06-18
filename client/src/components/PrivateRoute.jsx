import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAppContext();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;