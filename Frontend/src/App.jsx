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
import RecruiterCandidates from './pages/recruiter/Candidates';
import TestResults from './pages/recruiter/TestResults';

// Candidate pages
import CandidateStatus from './pages/candidate/Status';
import CandidateJobs from './pages/candidate/Jobs';
import Apply from './pages/candidate/Apply';
import TakeTest from './pages/candidate/TakeTest';

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
            <Route path="candidates" element={<RecruiterCandidates />} />
            <Route path="test-results/:testId" element={<TestResults />} />
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
            <Route path="apply/:jobId" element={<Apply />} />
            <Route path="test/:testId" element={<TakeTest />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
