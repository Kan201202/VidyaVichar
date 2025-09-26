import { request } from "./client.js";

export const login  = (email, password) =>
  request("/auth/login",  { method: "POST", body: { email, password } });

export const signup = (name, email, password) =>
  request("/auth/signup", { method: "POST", body: { name, email, password } });

export const me = (token) =>
  request("/auth/me", { token });
