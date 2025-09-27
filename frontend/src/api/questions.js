import { request } from "./client.js";

// Fetch list of questions for a course
export const list = (params = {}, token) => {
  const q = new URLSearchParams(params).toString();
  return request(`/questions${q ? `?${q}` : ""}`, { token });
};

// Create a new question
export const create = (data, token) =>
  request("/questions", { method: "POST", body: data, token });

// Update a question (status, pin, or answer)
export const update = (id, patch, token) =>
  request(`/questions/${id}`, { method: "PATCH", body: patch, token });

// Delete a specific question
export const remove = (id, token) =>
  request(`/questions/${id}`, { method: "DELETE", token });

// Clear answered OR all questions for a course
export const clear = (scope, token, courseId) =>
  request(`/questions/clear`, {
    method: "POST",
    body: { scope, courseId }, // ✅ Added courseId here
    token,
  });
