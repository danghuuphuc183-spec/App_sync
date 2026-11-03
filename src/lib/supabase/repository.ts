/**
 * Repository Layer (Backend Patterns)
 * Decouples database operations from route handlers and presentation logic.
 */

import { CANDIDATES_DATA } from "@/features/match/candidates.data";
import { rankCandidates, UserPreferences } from "@/features/match/matcher";
import { SAMPLE_COACHES } from "@/features/coaching/coaching.data";
import { Coach } from "@/features/coaching/coaching.types";
import { SPORTS_VENUES_DATABASE, SportsVenue } from "@/features/venues/venues.data";
import { STRAVA_ROUTES, StravaRoute } from "@/features/venues/routes.data";
import { CoachBookingInput, CoachFilterInput, VenueFilterInput } from "@/lib/validation/schemas";

export interface BookingRecord {
  id: string;
  coachId: string;
  athleteName: string;
  athleteContact: string;
  date: string;
  slot: string;
  notes?: string;
  status: "confirmed" | "pending";
  createdAt: string;
}

// In-memory persistent store for development & mock runs
const mockBookings: BookingRecord[] = [];

export const MatchRepository = {
  findCandidates() {
    return CANDIDATES_DATA;
  },

  getRecommendedPartners(user: UserPreferences, options?: { explorationRate?: number; limit?: number }) {
    const candidates = CANDIDATES_DATA.filter((c) => c.sport === user.sport);
    const ranked = rankCandidates(user, candidates.length > 0 ? candidates : CANDIDATES_DATA, {
      explorationRate: options?.explorationRate ?? 0.1,
    });
    return ranked.slice(0, options?.limit ?? 10);
  },
};

export const CoachRepository = {
  findAll(filter?: CoachFilterInput): Coach[] {
    let list = [...SAMPLE_COACHES];

    if (filter?.mode && filter.mode !== "all") {
      const modeKey = filter.mode === "1on1" ? "1:1" : "group";
      list = list.filter((coach) => coach.trainingModes.includes(modeKey));
    }

    if (filter?.sport) {
      const sportLower = filter.sport.toLowerCase();
      list = list.filter((coach) => coach.sportCategory.toLowerCase().includes(sportLower));
    }

    if (filter?.district) {
      const distLower = filter.district.toLowerCase();
      list = list.filter((coach) => coach.locations.some((loc) => loc.toLowerCase().includes(distLower)));
    }

    if (filter?.query) {
      const q = filter.query.toLowerCase();
      list = list.filter(
        (coach) =>
          coach.name.toLowerCase().includes(q) ||
          coach.title.toLowerCase().includes(q) ||
          coach.bio.toLowerCase().includes(q) ||
          coach.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    return list.slice(0, filter?.limit ?? 20);
  },

  findById(id: string): Coach | undefined {
    return SAMPLE_COACHES.find((c) => c.id === id);
  },

  createBooking(input: CoachBookingInput): BookingRecord {
    const newBooking: BookingRecord = {
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      coachId: input.coachId,
      athleteName: input.athleteName,
      athleteContact: input.athleteContact,
      date: input.date,
      slot: input.slot,
      notes: input.notes,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    mockBookings.push(newBooking);
    return newBooking;
  },

  getBookings(): BookingRecord[] {
    return [...mockBookings];
  },
};

export const VenueRepository = {
  getVenues(filter?: VenueFilterInput): SportsVenue[] {
    let list = [...SPORTS_VENUES_DATABASE];

    if (filter?.district) {
      const d = filter.district.toLowerCase();
      list = list.filter((v) => v.district.toLowerCase().includes(d));
    }

    if (filter?.sport) {
      const s = filter.sport.toLowerCase();
      list = list.filter((v) => v.sport.toLowerCase().includes(s) || v.sportVi.toLowerCase().includes(s));
    }

    if (filter?.query) {
      const q = filter.query.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.address.toLowerCase().includes(q) ||
          v.amenities.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list.slice(0, filter?.limit ?? 20);
  },

  getRoutes(): StravaRoute[] {
    return STRAVA_ROUTES;
  },
};
