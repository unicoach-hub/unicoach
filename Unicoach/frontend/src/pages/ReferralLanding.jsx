import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveReferral } from '../utils/referral';

// www.unicoach.com/r/<mentor-handle>: remember the mentor, then send the student to sign up
const ReferralLanding = () => {
  const { handle } = useParams();
  const { user } = useAuth();
  // Saved during render: the redirect below happens before any effect of this component would run
  saveReferral(handle);
  return <Navigate to={user ? '/dashboard' : '/signup'} replace />;
};

export default ReferralLanding;
