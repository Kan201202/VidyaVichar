import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import StudentBoard from "./pages/StudentBoard.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
import StudentLanding from "./pages/StudentLanding.jsx";
import InstructorLanding from "./pages/InstructorLanding.jsx";
import History from "./pages/History.jsx";
import AuthGuard from "./components/AuthGuard.jsx";
import Navbar from "./components/Navbar.jsx";
import CourseCreation from "./pages/CourseCreation.jsx";
import CourseBrowser from "./pages/CourseBrowser.jsx"; // You'll create this next
import { useAuth } from "./context/AuthProvider.jsx";

function RoleBasedLanding() {
  const { user, token } = useAuth();
  
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === 'instructor') return <Navigate to="/instructor-landing" replace />;
  return <Navigate to="/student-landing" replace />;
}

export default function App() {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl p-4">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Role-based landing (protected) */}
          <Route path="/" element={<RoleBasedLanding />} />
          <Route path="/landing" element={<RoleBasedLanding />} />
          
          {/* Student Flow (protected) */}
          <Route path="/student-landing" element={
            <AuthGuard>
              <StudentLanding />
            </AuthGuard>
          } />
          <Route path="/student-board/:courseId" element={
            <AuthGuard>
              <StudentBoard />
            </AuthGuard>
          } />
          
          {/* Instructor Flow (protected) */}
          <Route path="/instructor-landing" element={
            <AuthGuard>
              <InstructorLanding />
            </AuthGuard>
          } />
          <Route path="/instructor-dashboard/:courseId" element={
            <AuthGuard>
              <InstructorDashboard />
            </AuthGuard>
          } />
          
          {/* Course Management Routes (protected) */}
          <Route path="/create-course" element={
            <AuthGuard>
              <CourseCreation />
            </AuthGuard>
          } />
          <Route path="/browse-courses" element={
            <AuthGuard>
              <CourseBrowser />
            </AuthGuard>
          } />
          
          {/* Common (protected) */}
          <Route path="/history" element={
            <AuthGuard>
              <History />
            </AuthGuard>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}