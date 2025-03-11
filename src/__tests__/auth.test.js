const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");

describe("Authentication API", () => {
    let token;

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("should register a new user", async () => {
        const res = await request(app).post("/api/auth/register").send({
            name: "Test User",
            email: "testuser@example.com",
            password: "password123",
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("token");
    });

    it("should login a user and return a token", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "testuser@example.com",
            password: "password123",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        token = res.body.token;
    });

    it("should fetch user profile with valid token", async () => {
        const res = await request(app)
            .get("/api/auth/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("email", "testuser@example.com");
    });
});
