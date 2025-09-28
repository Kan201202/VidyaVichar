import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

export default function Home() {
  const { token, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to VidyaVichara
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          An interactive Q&A platform for classrooms. Engage with your students in real-time, 
          answer questions efficiently, and make learning more interactive.
        </p>
        
        {!token ? (
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link 
              to={user?.role === 'instructor' ? '/instructor-landing' : '/student-landing'}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold mb-2">For Instructors</h3>
            <p className="text-gray-600">
              Create courses, start live sessions, manage questions, and engage with students in real-time.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl mb-4">👩‍🎓</div>
            <h3 className="text-xl font-semibold mb-2">For Students</h3>
            <p className="text-gray-600">
              Join courses, ask questions during live sessions, and get instant answers from your instructors.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Interaction</h3>
            <p className="text-gray-600">
              Live Q&A sessions with instant updates and seamless communication between students and instructors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}