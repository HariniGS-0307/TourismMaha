import { describe, expect, it } from "vitest";
import { reserveSlotCapacity } from "@/server/services/booking-service";

describe("booking capacity logic", () => {
  it("allows only one reservation on the last available slot", () => {
    const capacity = 5;
    const firstAttempt = reserveSlotCapacity(capacity, 4, 1);
    const secondAttempt = reserveSlotCapacity(capacity, firstAttempt.bookedCount, 1);

    expect(firstAttempt.success).toBe(true);
    expect(firstAttempt.bookedCount).toBe(5);
    expect(secondAttempt.success).toBe(false);
    expect(secondAttempt.bookedCount).toBe(5);
  });
});
