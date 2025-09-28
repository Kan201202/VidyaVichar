import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import * as qApi from "../api/questions.js";
import * as courseApi from "../api/courses.js";

export default function History() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        let allQuestions = [];
        
        if (user?.role === 'instructor') {
          // For instructors: Get all their courses, then get questions from each course
          const courses = await courseApi.getMyCourses(token);
          
          // Load questions from each course
          for (const course of courses) {
            try {
              const courseQuestions = await qApi.list({ courseId: course._id }, token);
              
              // Add course information to each question
              const questionsWithCourseInfo = courseQuestions.map(question => ({
                ...question,
                courseName: course.name,
                courseCode: course.code,
                courseInstructor: course.instructorId?.name || 'Unknown'
              }));
              
              allQuestions = [...allQuestions, ...questionsWithCourseInfo];
            } catch (error) {
              console.error(`Failed to load questions for course ${course.name}:`, error);
            }
          }
        } else {
          // For students: Get their question history and enhance with course info
          const studentQuestions = await qApi.history(token);
          const courses = await courseApi.getMyCourses(token);
          const courseMap = {};
          
          // Create a map for quick course lookup
          courses.forEach(course => {
            courseMap[course._id] = course;
          });
          
          // Enhance questions with course information
          allQuestions = studentQuestions.map(question => ({
            ...question,
            courseName: courseMap[question.courseId]?.name,
            courseCode: courseMap[question.courseId]?.code,
            courseInstructor: courseMap[question.courseId]?.instructorId?.name || 'Unknown'
          }));
        }
        
        setItems(allQuestions);
      } catch (error) {
        console.error("Failed to load history:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      loadHistory();
    }
  }, [token, user?.role, user?.id]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const searchTerm = query.toLowerCase();
    return items.filter(item => 
      item.text?.toLowerCase().includes(searchTerm) ||
      item.courseName?.toLowerCase().includes(searchTerm) ||
      item.courseCode?.toLowerCase().includes(searchTerm)
    );
  }, [items, query]);

  return (
    <div className="space-y-4">
      <div className="vv-panel p-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Question History</h1>
          <p className="text-sm text-slate-500">
            {items.length} total {user?.role === 'instructor' ? '(across all courses)' : ''}
          </p>
        </div>
        <input 
          className="vv-input w-64" 
          placeholder="Search questions…" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
        />
      </div>

      {loading ? (
        <div className="vv-panel p-6 animate-pulse text-slate-500">
          Loading your history…
        </div>
      ) : filtered.length === 0 ? (
        <div className="vv-panel p-6 text-slate-500">
          {items.length === 0 ? "No questions found." : "No matching questions."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(question => (
            <div key={question._id} className="vv-card transition will-change-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-start justify-between mb-2">
                <span className={`vv-badge capitalize ${
                  question.status === 'answered' ? 'bg-green-100 text-green-800' :
                  question.status === 'important' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {question.status ?? "unanswered"}
                </span>
                <div className="flex gap-1">
                  {question.pinned && <span className="vv-chip bg-red-100 text-red-800">📌 Pinned</span>}
                </div>
              </div>
              
              <p className="vv-title mt-2 line-clamp-3">{question.text}</p>
              
              <div className="vv-meta mt-3 space-y-2">
                <div className="text-xs text-gray-500">
                  {new Date(question.createdAt).toLocaleString()}
                </div>
                
                {/* Course Information */}
                <div className="flex flex-wrap gap-1">
                  <span className="vv-chip bg-blue-100 text-blue-800">
                    {question.courseCode || `Course: ${String(question.courseId).slice(-6).toUpperCase()}`}
                  </span>
                  {question.courseName && (
                    <span className="vv-chip bg-purple-100 text-purple-800">
                      {question.courseName}
                    </span>
                  )}
                </div>
                
                {/* Role-specific additional info */}
                {user?.role === 'instructor' && question.author && (
                  <span className="vv-chip bg-green-100 text-green-800">
                    Student: {question.author}
                  </span>
                )}
                
                {user?.role === 'student' && question.courseInstructor && (
                  <span className="vv-chip bg-orange-100 text-orange-800">
                    Instructor: {question.courseInstructor}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}