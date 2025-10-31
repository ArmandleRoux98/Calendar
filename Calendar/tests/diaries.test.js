import { jest } from "@jest/globals";
const mockFetch = jest.fn();

// Mocking node-fetch
jest.unstable_mockModule("node-fetch", () => ({
  default: mockFetch
}));

import request from "supertest";
const { default: app } = await import("../server");

describe("GET /diaries", () => {

    beforeEach(() => {
        mockFetch.mockReset();
    });

    it("should return list of available diaries", async () => {
        // Arrange
        const mockResponse = {
            "status": "OK",
            "data": [
                {
                    "uid": 5,
                    "entity_uid": 5,
                    "name": "GP_5"
                }
            ]
        }
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        // Act
        const res = await request(app)
            .get("/diaries");

        // Assert
        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].uid).toBe(5);
        expect(res.body.data[0].entity_uid).toBe(5);
        expect(res.body.data[0].name).toBe("GP_5");
    });

    it("should return 500 when fetch call fails", async () => {
        // Arrange
        mockFetch.mockResolvedValue({
            status: 500
        });

        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        // Act
        const res = await request(app)
            .get("/diaries");

        // Assert
        expect(res.statusCode).toBe(500);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Error:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});
