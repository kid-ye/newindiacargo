import { describe, it, expect } from "vitest";
import { statusClass } from "./utils";

describe("statusClass utility", () => {
  it("should format single word status correctly", () => {
    expect(statusClass("Placed")).toBe("dash-status dash-status-placed");
  });

  it("should format multi-word status correctly, replacing spaces with dashes", () => {
    expect(statusClass("In Transit")).toBe(
      "dash-status dash-status-in-transit",
    );
    expect(statusClass("Out for Delivery")).toBe(
      "dash-status dash-status-out-for-delivery",
    );
  });

  it("should handle all uppercase words", () => {
    expect(statusClass("DELIVERED")).toBe("dash-status dash-status-delivered");
  });
});
