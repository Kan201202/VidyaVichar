import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
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
import CourseBrowser from "./pages/CourseBrowser.jsx";
import { useAuth } from "./context/AuthProvider.jsx";

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Student Flow (protected) */}
      <Route path="/student-landing" element={
        <AuthGuard>
          <StudentLanding key={`student-${user?.id}`} />
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
          <InstructorLanding key={`instructor-${user?.id}`} />
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
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default function App() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <Navbar />
      {/* Add key to force re-render when user changes */}
      <main key={user?.id} className="mx-auto w-full">
        <AppRoutes />
      </main>
    </div>
  );
}