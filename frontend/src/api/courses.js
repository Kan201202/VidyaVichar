import { request } from "./client.js";

export const createCourse = (data, token) =>
  request("/courses", { method: "POST", body: data, token });

export const getMyCourses = (token) =>
  request("/courses/my-courses", { token });

export const getAvailableCourses = (token) =>
  request("/courses/available", { token });

export const enrollInCourse = (courseId, token) =>
  request(`/courses/${courseId}/enroll`, { method: "POST", token });