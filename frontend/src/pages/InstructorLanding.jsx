import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import { getMyCourses } from "../api/courses.js";

export default function InstructorLanding() {
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
      <h1 className="text-2xl font-bold mb-6">Welcome Instructor 👨‍🏫</h1>
      <p className="mb-4 text-gray-600">Select a course to manage questions:</p>

      {courses.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          You haven't created any courses yet.
          <br />
          <Link to="/create-course" className="mt-4 inline-block text-blue-600 hover:underline">
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link
              key={course._id}
              to={`/instructor-dashboard/${course._id}`}
              className="p-6 rounded-xl border shadow hover:shadow-lg transition bg-green-50 hover:bg-green-100"
            >
              <h2 className="text-lg font-semibold">{course.name}</h2>
              <p className="text-sm text-gray-600">{course.code}</p>
              <p className="text-xs text-gray-500 mt-2">
                Click to open instructor dashboard
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}