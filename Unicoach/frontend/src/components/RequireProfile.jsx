
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Everyone opening the student dashboard fills the one-time onboarding form first (admins skip it)
const RequireProfile = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  // Only when the server says so (profileCompleted === false): an older backend that doesn't send the
  // flag must never lock students out of their dashboard
  const needsProfile = !loading && user && user.role !== 'admin'
    && user.profileCompleted === false && !user.profileCompletedAt;
  if (needsProfile) {
    return <Navigate to={`/onboarding?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
};

export default RequireProfile;
