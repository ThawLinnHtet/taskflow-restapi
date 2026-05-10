import request from "supertest";
import app from "../../app.js";

let TOKEN_CACHE = "";

export const loginAs = async (email: string, password: string) => {
  if (TOKEN_CACHE) return TOKEN_CACHE;

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  TOKEN_CACHE = res.body.data.accessToken;
  return TOKEN_CACHE;
};

export const registerAndGetToken = async (email: string, password: string, name?: string) => {
  await request(app)
    .post("/api/auth/register")
    .send({ email, password, name: name || "Test User" });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.data.accessToken;
};

export const api = (token?: string) => {
  const req = request(app);
  if (token) {
    req.set("Authorization", `Bearer ${token}`);
  }
  return req;
};
