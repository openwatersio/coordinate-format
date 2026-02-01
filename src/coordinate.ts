export type CoordinateComponents = {
  degrees?: number;
  minutes?: number;
  seconds?: number;
  sign?: number;
};

/**
 * Represents a coordinate value (latitude or longitude) with computed properties
 * for degrees, minutes, seconds, and sign.
 *
 * @example
 * ```typescript
 * const coord = new Coordinate(-35.282);
 * coord.sign;      // -1
 * coord.degrees;   // 35.282
 * coord.minutes;   // 16.92
 * coord.seconds;   // 55.2
 * ```
 */
export abstract class Coordinate {
  /**
   * Creates a new Coordinate instance.
   *
   * @param value - The decimal coordinate value (positive or negative)
   */
  constructor(public value: number) {}

  /**
   * Creates a Coordinate from its component parts (degrees, minutes, seconds).
   *
   * @returns A new Coordinate instance with the calculated decimal value
   *
   * @example
   * ```typescript
   * // Create a coordinate from DMS components
   * const coord = Coordinate.from({ degrees: 35, minutes: 16, seconds: 55.2 });
   * coord.value; // 35.281533...
   *
   * const south = Coordinate.from({
   *   sign: -1,
   *   degrees: 35,
   *   minutes: 16,
   *   seconds: 55.2
   * });
   * south.value; // -35.281533...
   * ```
   */
  static from(components: CoordinateComponents): Coordinate {
    return new Coordinate(0).set(components);
  }

  /**
   * Creates a new Coordinate with updated components.
   * Any unspecified components default to their current values.
   *
   * @param components - An object with optional degrees, minutes, and seconds to update
   * @param components.degrees - New degrees value (defaults to current degrees)
   * @param components.minutes - New minutes value (defaults to current minutes)
   * @param components.seconds - New seconds value (defaults to current seconds)
   * @returns A new Coordinate instance with the updated value
   *
   * @example
   * ```typescript
   * const coord = new Coordinate(-35.282);
   *
   * // Update only seconds
   * const updated = coord.set({ seconds: 30 });
   * updated.value; // approximately -35.2583...
   *
   * // Update multiple components
   * const modified = coord.set({ degrees: 40, minutes: 0 });
   * modified.value; // exactly -40
   *
   * // Update while preserving sign
   * const withNewDegrees = coord.set({ degrees: 45 });
   * withNewDegrees.value; // approximately -45 (negative sign preserved)
   * ```
   */
  set({
    // Use provided values or default to current values
    sign = this.sign,
    degrees = this.degrees,
    minutes = this.minutes,
    seconds = this.seconds,
  }: CoordinateComponents): Coordinate {
    // Calculate new decimal value: degrees + minutes/60 + seconds/3600
    const value = sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);

    return new Coordinate(value);
  }

  /**
   * Returns the sign of the coordinate value: 1 for positive/zero, -1 for negative.
   */
  get sign() {
    return this.value >= 0 ? 1 : -1;
  }

  /**
   * Returns the absolute value of the coordinate (always positive).
   */
  get degrees() {
    return Math.abs(this.value);
  }

  /**
   * Returns the minutes component of the coordinate.
   * Calculated as the fractional part of degrees multiplied by 60.
   */
  get minutes() {
    return (this.degrees % 1) * 60;
  }

  /**
   * Returns the seconds component of the coordinate.
   * Calculated as the fractional part of minutes multiplied by 60.
   */
  get seconds() {
    return (this.minutes % 1) * 60;
  }
}

/**
 * Represents a latitude coordinate.
 */
export class Latitude extends Coordinate {}

/**
 * Represents a longitude coordinate.
 */
export class Longitude extends Coordinate {}
