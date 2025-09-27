import { request } from "./client.js";

/**
 * Start a new session for a course
 * @param {Object} data - { courseId, title }
 * @param {string} token - JWT token
 */
export const startSession = (data, token) =>
  request("/sessions", {
    method: "POST",
    body: data,
    token,
  });

/**
 * End a session by session ID
 * @param {string} sessionId
 * @param {string} token
 */
export const endSession = (sessionId, token) =>
  request(`/sessions/${sessionId}/end`, {
    method: "PATCH",
    token,
  });

/**
 * Fetch the currently active session for a given course
 * @param {string} courseId
 * @param {string} token
 */
export const getActiveSession = async (courseId, token) => {
  return request(`/sessions/course/${courseId}/active`, {
    method: "GET",
    token,
  });
};
