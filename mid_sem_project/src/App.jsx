import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import StudentBoard from "./pages/StudentBoard.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
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
          <Route path="/" element={<StudentBoard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Protected (host/instructor) */}
          <Route
            path="/instructor"
            element={
              <AuthGuard>
                <InstructorDashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/history"
            element={
              <AuthGuard>
                <History />
              </AuthGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
