 import { request } from "./client.js";

 export const list = (params = {}, token) => {
   const q = new URLSearchParams(params).toString();
   return request(`/questions${q ? `?${q}` : ""}`, { token });  //← token should be passed
 };

 export const create = (data, token) =>
   request("/questions", { method: "POST", body: data, token }); // ← token should be passed

 export const update = (id, patch, token) =>
   request(`/questions/${id}`, { method: "PATCH", body: patch, token });

 export const remove = (id, token) =>
   request(`/questions/${id}`, { method: "DELETE", token });

 export const clear = (scope, token) =>
   request(`/questions/clear`, { method: "POST", body: { scope }, token });

// const base = "/api/questions";

// const headers = (token) => ({
//   "Content-Type": "application/json",
//   ...(token ? { Authorization: `Bearer ${token}` } : {}),
// });

// export async function list({ courseId }, token) {
//   const r = await fetch(`${base}?courseId=${courseId}`, { headers: headers(token) });
//   if (!r.ok) throw new Error("Failed to load questions");
//   return r.json();
// }

// export async function create({ text, author, courseId }, token) {
//   const r = await fetch(base, {
//     method: "POST",
//     headers: headers(token),
//     body: JSON.stringify({ text, author, courseId }),
//   });
//   if (!r.ok) throw new Error("Failed to create question");
//   return r.json();
// }

// export async function update(id, patch, token) {
//   const r = await fetch(`${base}/${id}`, {
//     method: "PATCH",
//     headers: headers(token),
//     body: JSON.stringify(patch),
//   });
//   if (!r.ok) throw new Error("Failed to update question");
//   return r.json();
// }

// export async function remove(id, token) {
//   const r = await fetch(`${base}/${id}`, { method: "DELETE", headers: headers(token) });
//   if (!r.ok) throw new Error("Failed to delete question");
//   return r.json();
// }

// export async function clear(scope, courseId, token) {
//   const r = await fetch(`${base}/clear`, {
//     method: "POST",
//     headers: headers(token),
//     body: JSON.stringify({ scope, courseId }),
//   });
//   if (!r.ok) throw new Error("Failed to clear questions");
//   return r.json();
// }


export const history = (token) =>
  request("/questions/history", { token });
