import { describe, expect, it } from "vitest";
import { isReviewAllowed } from "@/server/services/review-service";

describe("review permission checks", () => {
  it("allows a completed booking owner to review once", () => {
    expect(
      isReviewAllowed({
        bookingUserId: "user-1",
        currentUserId: "user-1",
        bookingStatus: "COMPLETED",
        hasReview: false,
      }),
    ).toBe(true);
  });

  it("rejects duplicate or unauthorized reviews", () => {
    expect(
      isReviewAllowed({
        bookingUserId: "user-1",
        currentUserId: "user-2",
        bookingStatus: "COMPLETED",
        hasReview: false,
      }),
    ).toBe(false);

    expect(
      isReviewAllowed({
        bookingUserId: "user-1",
        currentUserId: "user-1",
        bookingStatus: "COMPLETED",
        hasReview: true,
      }),
    ).toBe(false);
  });
});
