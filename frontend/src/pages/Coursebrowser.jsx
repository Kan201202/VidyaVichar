import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { getAvailableCourses, enrollInCourse } from "../api/courses.js";

export default function CourseBrowser() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState({});

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getAvailableCourses(token);
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

  const handleEnroll = async (courseId) => {
    setEnrolling(prev => ({ ...prev, [courseId]: true }));
    
    try {
      const result = await enrollInCourse(courseId, token);
      console.log("Enrollment successful:", result);
      
      // Remove enrolled course from list
      setCourses(prev => prev.filter(course => course._id !== courseId));
      alert("Successfully enrolled in course!");
      
      // Redirect to My Courses after a delay
      setTimeout(() => {
        navigate('/student-landing');
      }, 1000);
      
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Failed to enroll: " + error.message);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading available courses...</div>;
  }

  return (
    <div className="mx-auto mt-8 max-w-4xl p-6 rounded-xl shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-6">Browse Available Courses</h1>
      
      {courses.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No available courses found. You may already be enrolled in all courses.
          <br />
          <Link to="/student-landing" className="mt-4 inline-block text-blue-600 hover:underline">
            View my courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="p-6 rounded-xl border shadow hover:shadow-lg transition bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{course.name}</h2>
                  <p className="text-sm text-gray-600">{course.code}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Instructor: {course.instructorId?.name || course.instructorId?.email || 'Unknown'}
                  </p>
                  {course.description && (
                    <p className="text-sm text-gray-700 mt-2">{course.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleEnroll(course._id)}
                  disabled={enrolling[course._id]}
                  className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {enrolling[course._id] ? "Enrolling..." : "Enroll"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}