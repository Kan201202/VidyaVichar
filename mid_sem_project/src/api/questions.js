import { request } from "./client.js";

export const list = (params = {}, token) => {
  const q = new URLSearchParams(params).toString();
  return request(`/questions${q ? `?${q}` : ""}`, { token });
};

export const create = (data, token) =>
  request("/questions", { method: "POST", body: data, token });

export const update = (id, patch, token) =>
  request(`/questions/${id}`, { method: "PATCH", body: patch, token });

export const remove = (id, token) =>
  request(`/questions/${id}`, { method: "DELETE", token });

export const clear = (scope, token) =>
  request(`/questions/clear`, { method: "POST", body: { scope }, token });
