import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import { getMyCourses } from "../api/courses.js";

export default function StudentLanding() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getMyCourses(token);
        setCourses(data || []);
      } catch (error) {
        console.error("Failed to load courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [token]);

  if (loading) {
    return <div className="text-center p-8">Loading your courses...</div>;
  }

  return (
    <div className="mx-auto mt-8 max-w-4xl p-6 rounded-xl shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-6">Welcome Student 👩‍🎓</h1>
      <p className="mb-4 text-gray-600">
        Select a course to ask or view questions:
      </p>

      {courses.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          You are not enrolled in any courses yet.
          <br />
          <button className="mt-4 text-blue-600 hover:underline">
            Browse available courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link
              key={course._id}
              to={`/student-board/${course._id}`}
              className="p-6 rounded-xl border shadow hover:shadow-lg transition bg-blue-50 hover:blue-green-100"
            >
              <h2 className="text-lg font-semibold">{course.name}</h2>
              <p className="text-sm text-gray-600">{course.code}</p>
              <p className="text-xs text-gray-500 mt-2">
                Click to view question board
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}