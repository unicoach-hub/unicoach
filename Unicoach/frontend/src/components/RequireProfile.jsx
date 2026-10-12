
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Everyone opening the student dashboard fills the one-time onboarding form first (admins skip it)
const RequireProfile = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const needsProfile = !loading && user && user.role !== 'admin'
    && !user.profileCompleted && !user.profileCompletedAt;
  if (needsProfile) {
    return <Navigate to={`/onboarding?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
};

export default RequireProfile;
