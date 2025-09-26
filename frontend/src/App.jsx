import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import StudentBoard from "./pages/StudentBoard.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
import StudentLanding from "./pages/StudentLanding.jsx"; // student landing
import InstructorLanding from "./pages/InstructorLanding.jsx"; // instructor landing
import History from "./pages/History.jsx";
import AuthGuard from "./components/AuthGuard.jsx";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl p-4">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} /> {/* Default → login */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Student Flow */}
          <Route path="/student-landing" element={<StudentLanding />} />
          <Route path="/student-board/:courseId" element={<StudentBoard />} />
          {/* Instructor Flow */}
          <Route
            path="/instructor-landing"
            element={
              <AuthGuard>
                <InstructorLanding />
              </AuthGuard>
            }
          />
          <Route
            path="/instructor-dashboard/:courseId"
            element={
              <AuthGuard>
                <InstructorDashboard />
              </AuthGuard>
            }
          />
          {/* Common (protected) */}
          <Route
            path="/history"
            element={
              <AuthGuard>
                <History />
              </AuthGuard>
            }
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
