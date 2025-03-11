const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");

describe("Trade API", () => {
    let token;
    let eventId = "test-event-id";

    beforeAll(async () => {
        const loginRes = await request(app).post("/api/auth/login").send({
            email: "testuser@example.com",
            password: "password123",
        });
        token = loginRes.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("should place a trade", async () => {
        const res = await request(app)
            .post("/api/trades")
            .set("Authorization", `Bearer ${token}`)
            .send({
                eventId,
                betAmount: 50,
                selectedOutcome: "Team A Wins",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("status", "pending");
    });

    it("should return user trade history", async () => {
        const res = await request(app)
            .get("/api/trades")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
