import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as healthHandler } from "./health/route";
import { POST as matchHandler } from "./match/route";
import { GET as coachingHandler } from "./coaching/route";
import { POST as bookHandler } from "./coaching/book/route";
import { GET as venuesHandler } from "./venues/route";

describe("Backend API Routes Integration (ECC Backend Patterns)", () => {
  it("GET /api/health returns 200 with service health status", async () => {
    const res = await healthHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("healthy");
    expect(json.data.service).toBe("Sync Athlete API");
  });

  it("POST /api/match validates inputs and returns ranked athletic partners", async () => {
    const req = new NextRequest("http://localhost:3000/api/match", {
      method: "POST",
      body: JSON.stringify({
        sport: "running",
        targetPaceSec: 330,
        preferredTimeSlot: "morning_early",
        maxDistanceKm: 10,
        traits: ["#Pace530", "#KỷLuậtSáng"],
        limit: 5,
      }),
    });

    const res = await matchHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data.length).toBeLessThanOrEqual(5);
    expect(json.data[0]).toHaveProperty("matchScore");
  });

  it("POST /api/match returns 400 VALIDATION_ERROR for invalid input", async () => {
    const req = new NextRequest("http://localhost:3000/api/match", {
      method: "POST",
      body: JSON.stringify({
        sport: "not_a_sport",
        targetPaceSec: -100, // Invalid negative pace
      }),
    });

    const res = await matchHandler(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /api/coaching lists coaches and respects mode filters", async () => {
    const req = new NextRequest("http://localhost:3000/api/coaching?mode=1on1&limit=10");
    const res = await coachingHandler(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    // Every coach returned must have 1on1 available
    json.data.forEach((coach: { trainingModes: string[] }) => {
      expect(coach.trainingModes).toContain("1:1");
    });
  });

  it("POST /api/coaching/book validates input and confirms booking", async () => {
    const req = new NextRequest("http://localhost:3000/api/coaching/book", {
      method: "POST",
      body: JSON.stringify({
        coachId: "coach-1",
        slot: "06:00 - 07:30",
        date: "2026-11-10",
        athleteName: "Hoàng Nam",
        athleteContact: "0901234567",
        notes: "Muốn luyện bài tập cải thiện sải chân marathon",
      }),
    });

    const res = await bookHandler(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.booking.coachId).toBe("coach-1");
    expect(json.data.booking.status).toBe("confirmed");
    expect(json.data.confirmationMessage).toContain("Hoàng Minh Long");
  });

  it("POST /api/coaching/book returns 404 for non-existent coach", async () => {
    const req = new NextRequest("http://localhost:3000/api/coaching/book", {
      method: "POST",
      body: JSON.stringify({
        coachId: "coach_non_existent_999",
        slot: "06:00 - 07:30",
        date: "2026-11-10",
        athleteName: "Hoàng Nam",
        athleteContact: "0901234567",
      }),
    });

    const res = await bookHandler(req);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("COACH_NOT_FOUND");
  });

  it("GET /api/venues returns venues and running routes", async () => {
    const req = new NextRequest("http://localhost:3000/api/venues?limit=10");
    const res = await venuesHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("venues");
    expect(json.data).toHaveProperty("routes");
    expect(Array.isArray(json.data.venues)).toBe(true);
    expect(Array.isArray(json.data.routes)).toBe(true);
  });
});
