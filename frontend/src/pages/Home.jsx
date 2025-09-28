import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

export default function Home() {
  const { token, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
  
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              VidyaVichara
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            An interactive Q&A platform for classrooms. Engage with your students in real-time,
            answer questions efficiently, and make learning more interactive.
          </p>

          {!token ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/login">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                  Sign Up
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to={user?.role === 'instructor' ? '/instructor-landing' : '/student-landing'}>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition">
                  Go to Dashboard
                </button>
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose VidyaVichara?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Designed specifically for educational environments to enhance communication and learning outcomes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg w-fit mb-4">
              <span className="text-white text-lg">👨‍🏫</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-blue-600">For Instructors</h3>
            <p className="text-gray-600">
              Create courses, start live sessions, manage questions, and engage with students in real-time.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg w-fit mb-4">
              <span className="text-white text-lg">👩‍🎓</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-600">For Students</h3>
            <p className="text-gray-600">
              Join courses, ask questions during live sessions, and get instant answers from your instructors.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg w-fit mb-4">
              <span className="text-white text-lg">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-purple-600">Real-time Interaction</h3>
            <p className="text-gray-600">
              Live Q&A sessions with instant updates and seamless communication between students and instructors.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Classroom?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join educators and students who are already using VidyaVichara to enhance their learning experience
          </p>
          {!token && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <span className="text-white text-lg">🎓</span>
            </div>
            <h3 className="text-lg font-bold">VidyaVichara</h3>
          </div>
          <p className="text-gray-400">Empowering education through interactive communication</p>
        </div>
      </footer>
    </div>
  );
}