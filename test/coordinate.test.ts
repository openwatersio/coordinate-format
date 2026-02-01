import { describe, test, expect } from "vitest";
import { Coordinate } from "../src/coordinate";

describe("Coordinate", () => {
  const latCoord = new Coordinate(-35.282);
  const lonCoord = new Coordinate(149.128684);

  test("has sign property based on value", () => {
    expect(latCoord.sign).toBe(-1);
    expect(lonCoord.sign).toBe(1);
  });

  test("computes degrees from absolute value", () => {
    expect(latCoord.degrees).toBe(35.282);
    expect(lonCoord.degrees).toBe(149.128684);
  });

  test("computes minutes from fractional degrees", () => {
    expect(latCoord.minutes).toBeCloseTo(16.92, 2);
    expect(lonCoord.minutes).toBeCloseTo(7.72104, 5);
  });

  test("computes seconds from fractional minutes", () => {
    expect(latCoord.seconds).toBeCloseTo(55.2, 1);
    expect(lonCoord.seconds).toBeCloseTo(43.262, 3);
  });

  test("Coordinate.from() creates from degrees only", () => {
    const coord = Coordinate.from({ degrees: 45 });
    expect(coord.value).toBe(45);
    expect(coord.sign).toBe(1); // positive sign
  });

  test("Coordinate.from() creates from degrees and minutes", () => {
    const coord = Coordinate.from({ degrees: 35, minutes: 16 });
    expect(coord.value).toBeCloseTo(35 + 16 / 60, 6);
    expect(coord.sign).toBe(1);
  });

  test("Coordinate.from() creates from degrees, minutes, and seconds", () => {
    const coord = Coordinate.from({ degrees: 35, minutes: 16, seconds: 55.2 });
    const expected = 35 + 16 / 60 + 55.2 / 3600;
    expect(coord.value).toBeCloseTo(expected, 6);
    expect(coord.degrees).toBeCloseTo(expected, 6);
  });

  test("Coordinate.from() handles negative degrees", () => {
    const coord = Coordinate.from({
      sign: -1,
      degrees: 35,
      minutes: 16,
      seconds: 55.2,
    });
    const expected = -1 * (35 + 16 / 60 + 55.2 / 3600);
    expect(coord.value).toBeCloseTo(expected, 6);
    expect(coord.sign).toBe(-1); // negative sign
  });

  test("Coordinate.from() with positive value and sign", () => {
    const coord = Coordinate.from({
      degrees: 149,
      minutes: 7,
      seconds: 43.262,
    });
    const expected = 149 + 7 / 60 + 43.262 / 3600;
    expect(coord.value).toBeCloseTo(expected, 6);
    expect(coord.sign).toBe(1);
  });

  test("Coordinate.from() with negative value and sign", () => {
    const coord = Coordinate.from({
      sign: -1,
      degrees: 149,
      minutes: 7,
      seconds: 43.262,
    });
    const expected = -1 * (149 + 7 / 60 + 43.262 / 3600);
    expect(coord.value).toBeCloseTo(expected, 6);
    expect(coord.sign).toBe(-1);
  });

  test("Coordinate.from() has default values for minutes and seconds", () => {
    const coord1 = Coordinate.from({ degrees: 45 });
    const coord2 = new Coordinate(45);
    expect(coord1.value).toBe(coord2.value);

    const coord3 = Coordinate.from({ degrees: 45, minutes: 30 });
    const expected = 45 + 30 / 60;
    expect(coord3.value).toBeCloseTo(expected, 6);
  });

  test("Coordinate.from() round-trip with getters", () => {
    const original = Coordinate.from({
      degrees: 59,
      minutes: 12,
      seconds: 7.7,
    });
    expect(Math.floor(original.degrees)).toBe(59);
    expect(Math.floor(original.minutes)).toBe(12);
    expect(original.seconds).toBeCloseTo(7.7, 1);
  });

  test("set() updates degrees only", () => {
    const coord = new Coordinate(-35.282);
    const updated = coord.set({ degrees: 40 });
    // Preserves minutes and seconds from original
    const expected = -1 * (40 + coord.minutes / 60 + coord.seconds / 3600);
    expect(updated.value).toBeCloseTo(expected, 6);
    expect(updated.sign).toBe(-1); // sign preserved
  });

  test("set() updates minutes only", () => {
    const coord = new Coordinate(-35.282);
    const updated = coord.set({ minutes: 30 });
    // Preserves degrees and seconds from original
    const expected = -1 * (coord.degrees + 30 / 60 + coord.seconds / 3600);
    expect(updated.value).toBeCloseTo(expected, 6);
    expect(updated.sign).toBe(-1); // sign still negative
  });

  test("set() updates seconds only", () => {
    const coord = new Coordinate(-35.282);
    const updated = coord.set({ seconds: 30 });
    // Preserves degrees and minutes from original
    const expected = -1 * (coord.degrees + coord.minutes / 60 + 30 / 3600);
    expect(updated.value).toBeCloseTo(expected, 6);
    expect(updated.sign).toBe(-1);
  });

  test("set() updates multiple components", () => {
    const coord = new Coordinate(-35.282);
    const updated = coord.set({ degrees: 45, minutes: 20, seconds: 15 });
    const expected = -1 * (45 + 20 / 60 + 15 / 3600);
    expect(updated.value).toBeCloseTo(expected, 6);
    expect(updated.sign).toBe(-1); // sign preserved
  });

  test("set() preserves sign from current value when updating positive", () => {
    const coord = new Coordinate(35.282);
    const updated = coord.set({ degrees: 40 });
    // Preserves minutes and seconds from original
    const expected = 40 + coord.minutes / 60 + coord.seconds / 3600;
    expect(updated.value).toBeCloseTo(expected, 6);
    expect(updated.sign).toBe(1);
  });

  test("set() respects sign parameter", () => {
    const coord = new Coordinate(35.282);
    const updated = coord.set({ degrees: 40, sign: -1 });
    // Preserves minutes and seconds from original, takes sign from sign parameter
    const expected = -1 * (40 + coord.minutes / 60 + coord.seconds / 3600);
    expect(updated.value).toBeCloseTo(expected, 6);
    expect(updated.sign).toBe(-1); // sign from sign parameter
  });

  test("set() preserves sign with positive value", () => {
    const coord = new Coordinate(149.128684);
    const updated = coord.set({ minutes: 10 });
    expect(updated.sign).toBe(1);
    // When calling set({ minutes: 10 }):
    // - degrees uses this.degrees (which is Math.abs(value) = 149.128684)
    // - minutes is set to 10
    // - seconds uses this.seconds (from the original fractional minutes)
    const expectedDegrees = 149.128684;
    const expectedMinutes = 10;
    const expectedSeconds = coord.seconds;
    const expected =
      expectedDegrees + expectedMinutes / 60 + expectedSeconds / 3600;
    expect(updated.value).toBeCloseTo(expected, 6);
  });

  test("set() creates new instance without mutating original", () => {
    const original = new Coordinate(-35.282);
    const updated = original.set({ degrees: 45 });
    expect(original.value).toBe(-35.282);
    // Preserves minutes and seconds from original
    const expected =
      -1 * (45 + original.minutes / 60 + original.seconds / 3600);
    expect(updated.value).toBeCloseTo(expected, 6);
  });

  test("set() with all components", () => {
    const coord = new Coordinate(10);
    const updated = coord.set({ degrees: 59, minutes: 12, seconds: 7.7 });
    const expected = 59 + 12 / 60 + 7.7 / 3600;
    expect(updated.value).toBeCloseTo(expected, 6);
  });

  test("set() preserves sign when updating from negative to positive", () => {
    const coord = new Coordinate(-35.282);
    // When setting positive degrees, it should keep negative sign from original (not explicitly negative)
    const updated = coord.set({ degrees: 45 });
    // Preserves minutes and seconds from original
    const expected = -1 * (45 + coord.minutes / 60 + coord.seconds / 3600);
    expect(updated.value).toBeCloseTo(expected, 6); // still negative (preserved from original)
  });

  test("set() with sign parameter changes sign", () => {
    const coord = new Coordinate(35.282);
    const updated = coord.set({ degrees: 45, sign: -1 });
    // Preserves minutes and seconds from original, takes sign from sign parameter
    const expected = -1 * (45 + coord.minutes / 60 + coord.seconds / 3600);
    expect(updated.value).toBeCloseTo(expected, 6);
    expect(updated.sign).toBe(-1);
  });

  test("Coordinate.from() uses set() internally", () => {
    // This verifies that from() properly initializes through set()
    const coord1 = Coordinate.from({
      degrees: 35,
      minutes: 16,
      seconds: 55.2,
    });
    const coord2 = new Coordinate(0).set({
      degrees: 35,
      minutes: 16,
      seconds: 55.2,
    });
    expect(coord1.value).toBeCloseTo(coord2.value, 6);
  });
});
