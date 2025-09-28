import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import Toolbar from "../components/Toolbar.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import * as qApi from "../api/questions.js";
import * as sessApi from "../api/sessions.js";
import useSocket from "../hooks/useSocket.js";

export default function InstructorDashboard() {
  const { token, user } = useAuth();
  const { courseId } = useParams();

  const [allQuestions, setAllQuestions] = useState([]);
  const [currentSessionQuestions, setCurrentSessionQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  const { connected, on } = useSocket(token);

  // Load active session and questions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load active session
        const session = await sessApi.getActiveSession(courseId, token);
        setActiveSession(session);

        // Load ALL questions for this course
        const questions = await qApi.list({ courseId }, token);
        setAllQuestions(questions || []);

        // For current session: start empty, questions will come via socket
        setCurrentSessionQuestions([]);

      } catch (error) {
        console.error("Failed to load data:", error);
        setAllQuestions([]);
        setCurrentSessionQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, token]);

  // Socket event handlers - SIMPLIFIED
  useEffect(() => {
    if (!activeSession) return;

    console.log('🎯 Setting up socket listeners for active session');

    const handleQuestionCreated = (question) => {
      if (question.courseId === courseId) {
        console.log('✅ Adding question to current session:', question.text);
        setCurrentSessionQuestions(prev => 
          prev.some(x => x._id === question._id) ? prev : [question, ...prev]
        );
        setAllQuestions(prev => 
          prev.some(x => x._id === question._id) ? prev : [question, ...prev]
        );
      }
    };

    const handleQuestionUpdated = (question) => {
      if (question.courseId === courseId) {
        setCurrentSessionQuestions(prev => 
          prev.map(x => x._id === question._id ? question : x)
        );
        setAllQuestions(prev => 
          prev.map(x => x._id === question._id ? question : x)
        );
      }
    };

    const handleQuestionDeleted = (id) => {
      setCurrentSessionQuestions(prev => prev.filter(x => x._id !== id));
      setAllQuestions(prev => prev.filter(x => x._id !== id));
    };

    const off1 = on('question:created', handleQuestionCreated);
    const off2 = on('question:updated', handleQuestionUpdated);
    const off3 = on('question:deleted', handleQuestionDeleted);

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      off1?.();
      off2?.();
      off3?.();
    };
  }, [on, courseId, activeSession]);

  // Filter current session questions for display
  const filtered = useMemo(() => {
    let arr = [...currentSessionQuestions];
    if (filter === "unanswered") arr = arr.filter(i => i.status === "unanswered");
    if (filter === "answered") arr = arr.filter(i => i.status === "answered");
    if (filter === "important") arr = arr.filter(i => i.status === "important");
    if (query) arr = arr.filter(i => i.text.toLowerCase().includes(query.toLowerCase()));
    if (sort === "newest") arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "oldest") arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return arr;
  }, [currentSessionQuestions, filter, sort, query]);

  // Rest of your functions remain the same...
  const toggleStatus = async (q, status) => {
    const next = q.status === status ? "unanswered" : status;
    try {
      const updated = await qApi.update(q._id, { status: next }, token);
      setCurrentSessionQuestions(prev => prev.map(x => x._id === updated._id ? updated : x));
      setAllQuestions(prev => prev.map(x => x._id === updated._id ? updated : x));
    } catch (error) {
      console.error("Failed to update question:", error);
    }
  };

  const togglePin = async (q) => {
    try {
      const updated = await qApi.update(q._id, { pinned: !q.pinned }, token);
      setCurrentSessionQuestions(prev => prev.map(x => x._id === updated._id ? updated : x));
      setAllQuestions(prev => prev.map(x => x._id === updated._id ? updated : x));
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const del = async (q) => {
    if (!confirm(`Delete question: "${q.text.substring(0, 50)}..."?`)) return;
    try {
      await qApi.remove(q._id, token);
      setCurrentSessionQuestions(prev => prev.filter(x => x._id !== q._id));
      setAllQuestions(prev => prev.filter(x => x._id !== q._id));
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const startClass = async () => {
    try {
      const session = await sessApi.startSession({ courseId }, token);
      setActiveSession(session);
      setCurrentSessionQuestions([]); // Start with empty questions
    } catch (error) {
      console.error("Failed to start session:", error);
      alert("Failed to start session");
    }
  };

  const endClass = async () => {
    try {
      if (!activeSession) return;
      await sessApi.endSession(activeSession._id, token);
      setActiveSession(null);
    } catch (error) {
      console.error("Failed to end session:", error);
      alert("Failed to end session");
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Instructor Dashboard</h1>
          <div className="text-xs opacity-60 mt-1">
            {connected ? "Live connected" : "Live connecting..."}
          </div>
          <div className="mt-2">
            {activeSession ? (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                🟢 Class LIVE - {currentSessionQuestions.length} questions this session
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                ⚫ Class OFF - Start session to receive questions
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {!activeSession ? (
            <button className="vv-btn bg-green-600 hover:bg-green-700 text-white" onClick={startClass}>
              Start Class Session
            </button>
          ) : (
            <button className="vv-btn bg-red-600 hover:bg-red-700 text-white" onClick={endClass}>
              End Class Session
            </button>
          )}
        </div>
      </div>

      {!activeSession ? (
        <div className="vv-panel p-8 text-center">
          <div className="text-4xl mb-4">👨‍🏫</div>
          <h2 className="text-xl font-semibold mb-2">No Active Session</h2>
          <p className="text-gray-600 mb-4">
            Start a class session to begin receiving student questions in real-time.
          </p>
          <button className="vv-btn vv-btn-primary" onClick={startClass}>
            Start Class Session
          </button>
        </div>
      ) : (
        <>
          <Toolbar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} query={query} setQuery={setQuery} />

          {loading ? (
            <div className="vv-panel p-6 text-center">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="vv-panel p-8 text-center">
              <div className="text-3xl mb-3">❓</div>
              <h3 className="text-lg font-medium mb-2">No Questions Yet</h3>
              <p className="text-gray-600">
                Questions from students will appear here as they submit them.
              </p>
            </div>
          ) : (
            <div className="vv-grid">
              {filtered.map((q) => (
                <QuestionCard
                  key={q._id}
                  q={q}
                  canModerate
                  onToggleStatus={toggleStatus}
                  onPin={togglePin}
                  onDelete={del}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}