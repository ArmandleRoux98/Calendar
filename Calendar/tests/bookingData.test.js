import { jest } from "@jest/globals";
const mockFetch = jest.fn();

// Mocking node-fetch
jest.unstable_mockModule("node-fetch", () => ({
  default: mockFetch
}));

import request from "supertest";
const { default: app } = await import("../server");

describe("GET /booking_type", () => {

    beforeEach(() => {
        mockFetch.mockReset();
    });

    it("should return list of available booking types", async () => {
        // Arrange
        const mockResponse = {
            "status": "OK",
            "data": [
                {
                    "uid": 20,
                    "name": "Test Type"
                },
                {
                    "uid": 21,
                    "name": "Test Type 2"
                }
            ]
        }
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        // Act
        const res = await request(app)
            .get("/booking_type");

        // Assert
        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].uid).toBe(20);
        expect(res.body.data[0].name).toBe("Test Type");
        expect(res.body.data[1].uid).toBe(21);
        expect(res.body.data[1].name).toBe("Test Type 2");
    });

    it("should return 500 when fetch call fails", async () => {
        // Arrange
        mockFetch.mockResolvedValue({
            status: 500
        });

        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        // Act
        const res = await request(app)
            .get("/booking_type");

        // Assert
        expect(res.statusCode).toBe(500);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Error:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});


describe("GET /booking_status", () => {

    beforeEach(() => {
        mockFetch.mockReset();
    });

    it("should return list of available booking statuses", async () => {
        // Arrange
        const mockResponse = {
            "status": "OK",
            "data": [
                {
                    "uid": 20,
                    "name": "Test Status"
                },
                {
                    "uid": 21,
                    "name": "Test Status 2"
                }
            ]
        }
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        // Act
        const res = await request(app)
            .get("/booking_status");

        // Assert
        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].uid).toBe(20);
        expect(res.body.data[0].name).toBe("Test Status");
        expect(res.body.data[1].uid).toBe(21);
        expect(res.body.data[1].name).toBe("Test Status 2");
    });

    it("should return 500 when fetch call fails", async () => {
        // Arrange
        mockFetch.mockResolvedValue({
            status: 500
        });

        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        // Act
        const res = await request(app)
            .get("/booking_status");

        // Assert
        expect(res.statusCode).toBe(500);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Error:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});


describe("GET /patient", () => {

    beforeEach(() => {
        mockFetch.mockReset();
    });

    it("should return list of available patients", async () => {
        // Arrange
        const mockResponse = {
            "status": "OK",
            "data": [
                {
                    "uid": 20,
                    "name": "Test1",
                    "surname": "Test1"
                },
                {
                    "uid": 21,
                    "name": "Test2",
                    "surname": "Test2"
                }
            ]
        }
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        // Act
        const res = await request(app)
            .get("/patient");

        // Assert
        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].uid).toBe(20);
        expect(res.body.data[0].name).toBe("Test1");
        expect(res.body.data[0].surname).toBe("Test1");
        expect(res.body.data[1].uid).toBe(21);
        expect(res.body.data[1].name).toBe("Test2");
        expect(res.body.data[1].surname).toBe("Test2");
    });

    it("should return 500 when fetch call fails", async () => {
        // Arrange
        mockFetch.mockResolvedValue({
            status: 500
        });

        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        // Act
        const res = await request(app)
            .get("/patient");

        // Assert
        expect(res.statusCode).toBe(500);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Error:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});
