import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Public & Onboarding Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RegisterCandidate from './pages/candidate/RegisterCandidate';
import EmployerRequest from './pages/EmployerRequest';
import VerifyEmail from './pages/VerifyEmail';
import AcceptInvite from './pages/AcceptInvite';

// Layouts
import RecruiterLayout from './layouts/RecruiterLayout';
import CandidateLayout from './layouts/CandidateLayout';
import AdminLayout from './layouts/AdminLayout';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterJobs from './pages/recruiter/Jobs';
import JobCreate from './pages/recruiter/JobCreate';
import RecruiterCandidates from './pages/recruiter/Candidates';
import TestResults from './pages/recruiter/TestResults';
import ReviewQueue from './pages/recruiter/ReviewQueue';
import AuditTrail from './pages/recruiter/AuditTrail';
import Interviews from './pages/recruiter/Interviews';
import Analytics from './pages/recruiter/Analytics';

// Candidate pages
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateStatus from './pages/candidate/Status';
import CandidateJobs from './pages/candidate/Jobs';
import JobDetail from './pages/candidate/JobDetail';
import Applications from './pages/candidate/Applications';
import Profile from './pages/candidate/Profile';
import Apply from './pages/candidate/Apply';
import TakeTest from './pages/candidate/TakeTest';
import ResumeUpload from './pages/candidate/ResumeUpload';
import RedactionReview from './pages/candidate/RedactionReview';
import DomainSelection from './pages/candidate/DomainSelection';
import Assessment from './pages/candidate/Assessment';
import CodingSandbox from './pages/candidate/CodingSandbox';
import AssessmentResult from './pages/candidate/AssessmentResult';
import CandidateInterviews from './pages/candidate/Interviews';

// Notifications & Admin pages
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import Billing from './pages/admin/Billing';
import AuditExplorer from './pages/admin/AuditExplorer';

// Shared & Legal System Pages
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Accessibility from './pages/Accessibility';
import SystemStatus from './pages/SystemStatus';
import NotFound from './pages/NotFound';

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

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page" style={{ textAlign: 'center' }}><div className="spinner" style={{ margin: '40px auto' }} /></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// ─── Smart Redirect after login ───────────────────────────────────────────────
const HomeRedirect = () => {
  const { user, isRecruiterSide } = useAuth();
  if (!user) return <Landing />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (isRecruiterSide) return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/candidate/dashboard" replace />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public & Onboarding */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<Navigate to="/register-candidate" replace />} />
            <Route path="/register-candidate" element={<RegisterCandidate />} />
            <Route path="/register/candidate" element={<RegisterCandidate />} />
            <Route path="/employer-request" element={<EmployerRequest />} />
            <Route path="/employers/request-access" element={<EmployerRequest />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />

            {/* Public / Candidate Job Exploration */}
            <Route path="/jobs" element={<CandidateJobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route
              path="/applications"
              element={
                <RequireCandidate>
                  <Applications />
                </RequireCandidate>
              }
            />

            {/* Authenticated Shared Pages */}
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <Notifications />
                </RequireAuth>
              }
            />

            {/* Admin Console */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="billing" element={<Billing />} />
              <Route path="audit" element={<AuditExplorer />} />
              <Route path="status" element={<SystemStatus />} />
            </Route>

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
              <Route path="jobs/create" element={<JobCreate />} />
              <Route path="jobs/post" element={<JobCreate />} />
              <Route path="jobs/:id/edit" element={<JobCreate />} />
              <Route path="candidates" element={<RecruiterCandidates />} />
              <Route path="interviews" element={<Interviews />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="test-results/:testId" element={<TestResults />} />
              <Route path="review" element={<ReviewQueue />} />
              <Route path="audit" element={<AuditTrail />} />
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
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="status" element={<CandidateDashboard />} />
              <Route path="jobs" element={<CandidateJobs />} />
              <Route path="apply/:jobId" element={<Apply />} />
              <Route path="resume" element={<ResumeUpload />} />
              <Route path="resume/review" element={<RedactionReview />} />
              <Route path="domain" element={<DomainSelection />} />
              <Route path="assessment/:id" element={<Assessment />} />
              <Route path="coding/:id" element={<CodingSandbox />} />
              <Route path="results/:id" element={<AssessmentResult />} />
              <Route path="results" element={<AssessmentResult />} />
              <Route path="applications" element={<Applications />} />
              <Route path="interviews" element={<CandidateInterviews />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="test/:testId" element={<TakeTest />} />
            </Route>

            {/* Shared, Legal & System Pages */}
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/status" element={<SystemStatus />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
