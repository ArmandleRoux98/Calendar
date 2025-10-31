import { jest } from "@jest/globals";
const mockFetch = jest.fn();

// Mocking node-fetch
jest.unstable_mockModule("node-fetch", () => ({
  default: mockFetch
}));

import request from "supertest";
const { default: app } = await import("../server");

describe("POST /login", () => {

    beforeEach(() => {
        mockFetch.mockReset();
    });

    it("should set cookie and return UID when login succeeds", async () => {
        // Arrange
        const mockResponse = {
            ok: true,
            status: "OK",
            data: { uid: "12345" }
        };

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        // Act
        const res = await request(app)
            .post("/login")
            .send({ username: "tester", password: "secret" });

        // Assert
        expect(res.statusCode).toBe(200);
        expect(res.body.uid).toBe("12345");
        expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should return 500 when login fails", async () => {
        // Arrange
        mockFetch.mockResolvedValue({
            status: "AUTH_FAILED:CREDENTIALS"
        });

        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        // Act
        const res = await request(app)
            .post("/login")
            .send({ username: "wrong", password: "wrong" });

        // Assert
        expect(res.statusCode).toBe(500);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Error:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});
