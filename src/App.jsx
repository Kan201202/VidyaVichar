import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import StudentBoard from "./pages/StudentBoard.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
import History from "./pages/History.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Navbar from "./components/Navbar.jsx";
import RoleGuard from "./components/RoleGuard.jsx"; // ADD THIS
import { AuthProvider } from "./context/AuthProvider.jsx"; // ADD THIS

export default function App() {
  return (
    <AuthProvider> {/* WRAP WITH AUTH PROVIDER */}
      <div className="min-h-dvh bg-gray-50 text-gray-900">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/board" element={<StudentBoard />} />
            
            {/* PROTECT DASHBOARD ROUTE */}
            <Route path="/dashboard" element={
              <RoleGuard allowedRoles={['instructor']}>
                <InstructorDashboard />
              </RoleGuard>
            } />
            
            <Route path="/history" element={<History />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}