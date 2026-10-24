// Students go straight to their dashboard after sign-in. The profile form is no longer a gate:
// the dashboard shows a "Complete your profile" card until it is filled in.
const RequireProfile = ({ children }) => children;

export default RequireProfile;
