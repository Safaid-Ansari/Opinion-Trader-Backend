const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");

describe("Event API", () => {
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("should fetch all events", async () => {
        const res = await request(app).get("/api/events");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
