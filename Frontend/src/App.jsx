import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Layouts
import RecruiterLayout from './layouts/RecruiterLayout';
import CandidateLayout from './layouts/CandidateLayout';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterJobs from './pages/recruiter/Jobs';
import JobCreate from './pages/recruiter/JobCreate';

// Candidate pages
import CandidateStatus from './pages/candidate/Status';
import CandidateJobs from './pages/candidate/Jobs';

// ─── Protected Route Guards ───────────────────────────────────────────────────
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page" style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '40px auto' }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RequireRecruiter = ({ children }) => {
  const { user, loading, isRecruiterSide } = useAuth();
  if (loading) return <div className="page" style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '40px auto' }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isRecruiterSide) return <Navigate to="/candidate/status" replace />;
  return children;
};

const RequireCandidate = ({ children }) => {
  const { user, loading, isCandidate } = useAuth();
  if (loading) return <div className="page" style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '40px auto' }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isCandidate) return <Navigate to="/recruiter/dashboard" replace />;
  return children;
};

// ─── Smart Redirect after login ───────────────────────────────────────────────
const HomeRedirect = () => {
  const { user, isRecruiterSide } = useAuth();
  if (!user) return <Landing />;
  if (isRecruiterSide) return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/candidate/status" replace />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Recruiter-side portal */}
          <Route
            path="/recruiter"
            element={
              <RequireRecruiter>
                <RecruiterLayout />
              </RequireRecruiter>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="jobs/new" element={<JobCreate />} />
            <Route path="jobs/:id/edit" element={<JobCreate />} />
            {/* Phase 2+ routes added here */}
          </Route>

          {/* Candidate portal */}
          <Route
            path="/candidate"
            element={
              <RequireCandidate>
                <CandidateLayout />
              </RequireCandidate>
            }
          >
            <Route index element={<Navigate to="status" replace />} />
            <Route path="status" element={<CandidateStatus />} />
            <Route path="jobs" element={<CandidateJobs />} />
            {/* Phase 2+ routes added here */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
