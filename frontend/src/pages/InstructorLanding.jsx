import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import { getMyCourses } from "../api/courses.js";
import { startSession, endSession, getActiveSession } from "../api/sessions.js";

export default function InstructorLanding() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState({}); // Track session per course
  const [loadingSessions, setLoadingSessions] = useState({}); // Track loading state per course

  // Load courses and check for active sessions
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await getMyCourses(token);
        setCourses(data || []);

        // Check active session for each course
        const sessionStates = {};
        for (const course of data) {
          try {
            const session = await getActiveSession(course._id, token);
            sessionStates[course._id] = session;
          } catch {
            sessionStates[course._id] = null;
          }
        }
        setActiveSessions(sessionStates);
      } catch (error) {
        console.error("Failed to load courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [token]);

  // Start session for a specific course
  const handleStart = async (courseId) => {
    try {
      setLoadingSessions((prev) => ({ ...prev, [courseId]: true }));
      const session = await startSession({ courseId }, token);
      setActiveSessions((prev) => ({ ...prev, [courseId]: session }));
    } catch (error) {
      alert("Failed to start session: " + error.message);
    } finally {
      setLoadingSessions((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  // End session for a specific course
  const handleEnd = async (courseId) => {
    try {
      setLoadingSessions((prev) => ({ ...prev, [courseId]: true }));
      const sessionId = activeSessions[courseId]?._id;
      if (!sessionId) return alert("No active session to end.");
      await endSession(sessionId, token);
      setActiveSessions((prev) => ({ ...prev, [courseId]: null }));
    } catch (error) {
      alert("Failed to end session: " + error.message);
    } finally {
      setLoadingSessions((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading your courses...</div>;
  }

  return (
    <div className="mx-auto mt-8 max-w-4xl p-6 rounded-xl shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-6">Welcome Instructor 👨‍🏫</h1>
      <p className="mb-4 text-gray-600">
        Start and manage live question sessions for each course:
      </p>

      {courses.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          You haven't created any courses yet.
          <br />
          <Link
            to="/create-course"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {courses.map((course) => {
            const activeSession = activeSessions[course._id];
            const isLoading = loadingSessions[course._id];

            return (
              <div
                key={course._id}
                className="p-6 rounded-xl border shadow hover:shadow-lg transition bg-green-50 hover:bg-green-100"
              >
                <h2 className="text-lg font-semibold">{course.name}</h2>
                <p className="text-sm text-gray-600">{course.code}</p>

                <p className="text-xs text-gray-500 mt-2">
                  {activeSession
                    ? `Session Active — started at ${new Date(
                        activeSession.startTime
                      ).toLocaleTimeString()}`
                    : "No session currently active"}
                </p>

                <div className="mt-4 flex gap-2">
                  {!activeSession ? (
                    <button
                      onClick={() => handleStart(course._id)}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-lg text-white transition ${
                        isLoading
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isLoading ? "Starting..." : "Start Session"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnd(course._id)}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-lg text-white transition ${
                        isLoading
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {isLoading ? "Ending..." : "End Session"}
                    </button>
                  )}

                  <Link
                    to={`/instructor-dashboard/${course._id}`}
                    className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Open Dashboard
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
