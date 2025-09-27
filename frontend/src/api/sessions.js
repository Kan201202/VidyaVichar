import { request } from "./client.js";

export const startSession = (data, token) =>
  request("/sessions", { method: "POST", body: data, token });

export const endSession = (sessionId, token) =>
  request(`/sessions/${sessionId}/end`, { method: "PATCH", token });

export const getActiveSession = (courseId, token) =>
  request(`/sessions/course/${courseId}/active`, { token });