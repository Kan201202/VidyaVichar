import { request } from "./client.js";

const DEMO = true;                 // keep demo on; swap to false when you have a backend
const KEY = "vv_demo_questions";   // stored as array of { ... , classId }

function load() { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
function save(v) { localStorage.setItem(KEY, JSON.stringify(v)); }
function newId() { return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

async function demoList(params = {}) {
  const { classId } = params;
  let arr = load();
  if (classId) arr = arr.filter(q => q.classId === classId);
  return arr.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
async function demoCreate(data) {
  const { text, author, classId } = data || {};
  if (!classId) throw new Error("No active class");
  if (!text || !String(text).trim()) throw new Error("Text required");
  const q = {
    _id: newId(),
    classId,
    text: String(text).trim(),
    author: (author || "Anonymous").trim(),
    status: "unanswered",
    pinned: false,
    createdAt: new Date().toISOString(),
  };
  const arr = load(); arr.unshift(q); save(arr); return q;
}
async function demoUpdate(id, patch) {
  const arr = load();
  const i = arr.findIndex(x => x._id === id);
  if (i < 0) throw new Error("Not found");
  arr[i] = { ...arr[i], ...patch, updatedAt: new Date().toISOString() };
  save(arr); return arr[i];
}
async function demoRemove(id) {
  const arr = load();
  const next = arr.filter(x => x._id !== id);
  if (next.length === arr.length) throw new Error("Not found");
  save(next); return { ok: true };
}
async function demoClear(scope, classId) {
  let arr = load();
  if (!classId) throw new Error("No class selected");
  if (scope === "answered") arr = arr.filter(x => !(x.classId === classId && x.status === "answered"));
  else if (scope === "all") arr = arr.filter(x => x.classId !== classId);
  else throw new Error("Invalid scope");
  save(arr); return { ok: true };
}

// Exports (demo vs real)
export const list = (params = {}, token) =>
  DEMO ? demoList(params) : request(`/questions`, { token });

export const create = (data, token) =>
  DEMO ? demoCreate(data) : request(`/questions`, { method: "POST", body: data, token });

export const update = (id, patch, token) =>
  DEMO ? demoUpdate(id, patch) : request(`/questions/${id}`, { method: "PATCH", body: patch, token });

export const remove = (id, token) =>
  DEMO ? demoRemove(id) : request(`/questions/${id}`, { method: "DELETE", token });

export const clear = (scope, token, classId) =>
  DEMO ? demoClear(scope, classId) : request(`/questions/clear`, { method: "POST", body: { scope }, token });
