import { jest } from "@jest/globals";

// Mocking node-fetch
const mockFetch = jest.fn();
jest.unstable_mockModule("node-fetch", () => ({
  default: mockFetch
}));

import request from "supertest";
const { default: app } = await import("../server.js");


describe("GET /bookings", () => {

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("should return booking data when fetch succeeds", async () => {
    // Arrange
    const mockData = {
      data: [
        { uid: "1", patient_name: "John", patient_surname: "Doe" },
        { uid: "2", patient_name: "Jane", patient_surname: "Smith" }
      ]
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    });

    // Act
    const res = await request(app)
      .get("/bookings")
      .set("Cookie", "session_id=abc123")
      .query({ date: "2025-11-01", diary_uid: "5" });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle fetch failure gracefully", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({})
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Act
    const res = await request(app)
      .get("/bookings")
      .set("Cookie", "session_id=abc123")
      .query({ date: "2025-11-01", diary_uid: "5" });

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

});


describe("GET /bookings/:uid", () => {

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("should return booking data with given booking uid when fetch succeeds", async () => {
    // Arrange
    const mockData = {
      data: [
        { uid: "1", patient_name: "John", patient_surname: "Doe" }
      ]
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    });

    // Act
    const res = await request(app)
      .get("/bookings/1")
      .set("Cookie", "session_id=abc123");

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle fetch failure gracefully", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({})
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Act
    const res = await request(app)
      .get("/bookings/1")
      .set("Cookie", "session_id=abc123");

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

});


describe("PUT /update/:uid", () => {

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("should return booking uid of updated booking when fetch succeeds", async () => {
    // Arrange
    const mockData = {
      data: {
        uid: 123
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    });

    // Act
    const res = await request(app)
      .post("/update/1")
      .set("Cookie", "session_id=abc123")
      .send({ 
        "model": 
            {
                "uid": 1,
                "start_time": "2025-10-27T09:00:00",
                "duration": 50,
                "patient_uid": 11,
                "reason": "Test Update",
                "cancelled": false
            }
       });;

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle fetch failure gracefully", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({})
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Act
    const res = await request(app)
      .post("/update/1")
      .set("Cookie", "session_id=abc123")
      .send({ 
        "model": 
            {
                "uid": "1",
                "start_time": "2025-10-27T09:00:00",
                "duration": "50",
                "patient_uid": "11",
                "reason": "Test Update",
                "cancelled": false
            }
       });

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

});


describe("POST /create", () => {

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("should return new booking uid when fetch succeeds", async () => {
    // Arrange
    const mockData = {
      data: {
        uid: 123
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    });

    // Act
    const res = await request(app)
      .post("/create")
      .set("Cookie", "session_id=abc123")
      .query({ entity_uid: "5", diary_uid: "5" })
      .send({ 
            "entity_uid": 1,
            "diary_uid": 1,
            "booking_type": 20,
            "booking_status": 20,
            "booking_time": "09:00",
            "booking_date": "2025-10-27",
            "duration": 50,
            "patient": 11,
            "booking_reason": "Test Update",
            "cancelled": false
       });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.data.uid).toEqual(123);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle fetch failure gracefully", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({})
    });

    // Act
    const res = await request(app)
      .post("/create")
      .set("Cookie", "session_id=abc123")
      .query({ entity_uid: "5", diary_uid: "5" })
      .send({ 
        "model": 
            {
                "uid": "1",
                "start_time": "2025-10-27",
                "duration": "50",
                "patient_uid": "11",
                "reason": "Test Update",
                "cancelled": false
            }
       });
    
       // Assert
    expect(res.body.error).toBe("Invalid data - Bad Request");
  });

});


describe("PUT /delete/:uid", () => {

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("should return uid of cancelled booking data when fetch succeeds", async () => {
    // Arrange
    const mockData = {
      data: {
        uid: 123
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    });

    // Act
    const res = await request(app)
      .put("/delete/1")
      .set("Cookie", "session_id=abc123")
      .send({ 
        "model": 
            {
                "uid": 1,
                "cancelled": true
            }
       });;

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle fetch failure gracefully", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({})
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Act
    const res = await request(app)
      .put("/delete/1")
      .set("Cookie", "session_id=abc123")
      .send({ 
        "model": 
            {
                "uid": "1",
                "cancelled": "true"
            }
       });

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

});