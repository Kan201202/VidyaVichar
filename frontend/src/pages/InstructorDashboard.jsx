import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import Toolbar from "../components/Toolbar.jsx";
import * as qApi from "../api/questions.js";
import { CheckCircle, Trash2, Pin, MessageSquare } from "lucide-react";

export default function InstructorDashboard() {
  const { token } = useAuth();
  const { courseId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [answerModal, setAnswerModal] = useState({
    open: false,
    qId: null,
    text: "",
  });

  // Load questions
  const load = async () => {
    const data = await qApi.list({ courseId }, token);
    setItems(data ?? []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  // Answer save
  const submitAnswer = async () => {
    if (!answerModal.text.trim()) {
      alert("Answer cannot be empty!");
      return;
    }
    try {
      await qApi.update(
        answerModal.qId,
        { answer: answerModal.text, status: "answered", courseId },
        token
      );
      setAnswerModal({ open: false, qId: null, text: "" });
      await load();
    } catch (e) {
      alert("Failed to save answer: " + e.message);
    }
  };

  // Moderation actions
  const toggleStatus = async (q, status) => {
    const next = q.status === status ? "unanswered" : status;
    await qApi.update(q._id, { status: next, courseId }, token);
    await load();
  };

  const togglePin = async (q) => {
    const next = !q.pinned;
    await qApi.update(q._id, { pinned: next, courseId }, token);
    await load();
  };

  const del = async (q) => {
    if (!confirm("Delete this question?")) return;
    await qApi.remove(q._id, token);
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Instructor Dashboard - {courseId.toUpperCase()}
      </h1>

      {/* Question Grid */}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((q) => (
            <div
              key={q._id}
              className={`p-4 rounded-xl shadow-md ${
                q.pinned ? "bg-yellow-100 border-yellow-400" : "bg-pink-100"
              }`}
            >
              <p className="font-medium text-gray-800">{q.text}</p>
              <p className="text-xs text-gray-500 mb-2">
                Asked by: {q.studentId?.name || "Anonymous"}
              </p>

              {q.answer && (
                <div className="bg-green-100 p-2 rounded text-sm text-gray-700 mb-2">
                  <strong>Answer:</strong> {q.answer}
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() =>
                    setAnswerModal({
                      open: true,
                      qId: q._id,
                      text: q.answer || "",
                    })
                  }
                  className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  <MessageSquare size={14} /> Answer
                </button>
                <button
                  onClick={() => toggleStatus(q, "answered")}
                  className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                >
                  <CheckCircle size={14} />
                </button>
                <button
                  onClick={() => togglePin(q)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded text-sm"
                >
                  <Pin size={14} />
                </button>
                <button
                  onClick={() => del(q)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Answer Modal */}
      {answerModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-3">Provide Answer</h2>
            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              value={answerModal.text}
              onChange={(e) =>
                setAnswerModal({ ...answerModal, text: e.target.value })
              }
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() =>
                  setAnswerModal({ open: false, qId: null, text: "" })
                }
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitAnswer}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
