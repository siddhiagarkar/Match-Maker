import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function RequireAuth() {
  const user = useContext(AuthContext); // or const { user } = useContext(AuthContext);

  if (!user) {
    // not logged in → redirect
    return <Navigate to="/login" replace />;
  }

  // logged in → render nested routes
  return <Outlet />;
}

export default RequireAuth;
