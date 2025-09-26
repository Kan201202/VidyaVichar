// src/pages/InstructorLanding.jsx
import { Link } from "react-router-dom";

const courses = [
  { id: "c1", name: "Course C1" },
  { id: "c2", name: "Course C2" },
  { id: "c3", name: "Course C3" },
  { id: "c4", name: "Course C4" },
];

export default function InstructorLanding() {
  return (
    <div className="mx-auto mt-8 max-w-4xl p-6 rounded-xl shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-6">Welcome Instructor 👨‍🏫</h1>
      <p className="mb-4 text-gray-600">Select a course to manage questions:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/instructor-dashboard/${course.id}`}
            className="p-6 rounded-xl border shadow hover:shadow-lg transition bg-green-50 hover:bg-green-100"
          >
            <h2 className="text-lg font-semibold">{course.name}</h2>
            <p className="text-sm text-gray-600">
              Click to open instructor dashboard
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
