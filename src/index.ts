/**
 * Options for customizing the coordinate format output.
 */
export type CoordinateFormatOptions = {
  /** Number of decimal places to include in formatted output (default: 3) */
  precision?: number;
  /** Custom labels for coordinate components and directions */
  labels?: {
    /** Label for degrees symbol (default: "°") */
    degrees?: string;
    /** Label for minutes symbol (default: "′") */
    minutes?: string;
    /** Label for seconds symbol (default: "″") */
    seconds?: string;
    /** Labels for latitude directions [North, South] (default: ["N", "S"]) */
    latitude?: [string, string];
    /** Labels for longitude directions [East, West] (default: ["E", "W"]) */
    longitude?: [string, string];
  };
};

import { Coordinate, Latitude, Longitude } from "./coordinate";

/**
 * Formats decimal latitude and longitude coordinates into various string representations
 * including DMS (degrees, minutes, seconds), decimal degrees, and custom formats.
 *
 * @example
 * ```typescript
 * const formatter = new CoordinateFormat();
 * const [lon, lat] = formatter.format(149.128684, -35.282);
 * // lon: "149° 7.721′ E"
 * // lat: "35° 16.920′ S"
 * ```
 */
export class CoordinateFormat {
  /**
   * Predefined format aliases for common coordinate representations.
   * - "degrees": Decimal degrees with direction (e.g., "35.282° N")
   * - "minutes": Degrees and decimal minutes with direction (e.g., "35° 16.920′ N")
   * - "seconds": Full DMS with direction (e.g., "35° 16′ 55.200″ N")
   */
  static aliases = new Map<string, string>([
    ["degrees", "dd X"],
    ["minutes", "DD mm X"],
    ["seconds", "DD MM ss X"],
  ]);

  /**
   * Map of format tokens to their replacement functions.
   * Each token represents a specific component of a coordinate (degrees, minutes, seconds, etc.).
   */
  static readonly formats = new Map<
    string,
    (c: Coordinate, formatter: CoordinateFormat) => string
  >([
    ["DD", (c, { labels }) => [Math.floor(c.degrees), labels.degrees].join("")],
    [
      "dd",
      (c, { precision, labels }) =>
        [c.degrees.toFixed(precision), labels.degrees].join(""),
    ],
    ["D", (c) => Math.floor(c.degrees).toString()],
    ["d", (c, { precision }) => c.degrees.toFixed(precision)],
    ["MM", (c, { labels }) => [Math.floor(c.minutes), labels.minutes].join("")],
    [
      "mm",
      (c, { precision, labels }) =>
        [c.minutes.toFixed(precision), labels.minutes].join(""),
    ],
    ["M", (c) => Math.floor(c.minutes).toString()],
    ["m", (c, { precision }) => c.minutes.toFixed(precision)],
    [
      "ss",
      (c, { precision, labels }) =>
        [c.seconds.toFixed(precision), labels.seconds].join(""),
    ],
    ["s", (c, { precision }) => c.seconds.toFixed(precision)],
    ["-", (c) => (c.value < 0 ? "-" : "")],
    [
      "X",
      (c, { labels }) => {
        const directions =
          c instanceof Latitude ? labels.latitude : labels.longitude;
        return directions ? (c.value >= 0 ? directions[0] : directions[1]) : "";
      },
    ],
  ]);

  formatString: string;
  precision: number;
  labels: {
    degrees: string;
    minutes: string;
    seconds: string;
    latitude: [string, string];
    longitude: [string, string];
  };

  /**
   * Creates a new coordinate formatter with the specified format and options.
   *
   * @param formatString - Format string or alias ("degrees", "minutes", "seconds"), or custom format using tokens (DD, MM, ss, X, etc.)
   * @param options - Formatting options including precision and custom labels
   *
   * @example
   * ```typescript
   * // Using an alias
   * const formatter = new CoordinateFormat("minutes");
   *
   * // Using a custom format string
   * const formatter = new CoordinateFormat("DD MM ss X", { precision: 2 });
   *
   * // With custom labels
   * const formatter = new CoordinateFormat("DD MM ss X", {
   *   labels: { latitude: ["Norte", "Sur"] }
   * });
   * ```
   */
  constructor(
    formatString: string = "minutes",
    { precision = 3, labels = {} }: CoordinateFormatOptions = {},
  ) {
    this.formatString =
      CoordinateFormat.aliases.get(formatString) || formatString;
    this.precision = precision;
    this.labels = {
      degrees: "°",
      minutes: "′",
      seconds: "″",
      latitude: ["N", "S"],
      longitude: ["E", "W"],
      ...labels,
    };
  }

  /**
   * Formats a latitude value according to the configured format string.
   *
   * @param latitude - The latitude value in decimal degrees
   * @returns Formatted latitude string
   *
   * @example
   * ```typescript
   * const formatter = new CoordinateFormat("degrees");
   * formatter.latitude(-35.282); // "35.282° S"
   * ```
   */
  latitude(latitude: number): string {
    return this.formatCoordinate(new Latitude(latitude));
  }

  /**
   * Formats a longitude value according to the configured format string.
   *
   * @param longitude - The longitude value in decimal degrees
   * @returns Formatted longitude string
   *
   * @example
   * ```typescript
   * const formatter = new CoordinateFormat("degrees");
   * formatter.longitude(149.128684); // "149.129° E"
   * ```
   */
  longitude(longitude: number): string {
    return this.formatCoordinate(new Longitude(longitude));
  }

  /**
   * Formats a coordinate pair (longitude, latitude) according to the configured format string.
   *
   * @param values - Either two separate numbers (longitude, latitude) or an array [longitude, latitude]
   * @returns A tuple containing [formattedLongitude, formattedLatitude]
   * @throws {TypeError} If the provided values are not valid numbers
   *
   * @example
   * ```typescript
   * const formatter = new CoordinateFormat("minutes");
   *
   * // Using separate arguments
   * const [lon, lat] = formatter.format(149.128684, -35.282);
   *
   * // Using an array
   * const [lon, lat] = formatter.format([149.128684, -35.282]);
   * ```
   */
  format(...values: [number, number] | [[number, number]]): [string, string] {
    const [longitude, latitude] = values.flat();
    if (isNaN(longitude) || isNaN(latitude)) {
      throw new TypeError("longitude and latitude must be numbers");
    }

    return [this.longitude(longitude), this.latitude(latitude)];
  }

  /**
   * Parses coordinate strings back into decimal degree numbers.
   * Supports all formats that can be generated by the format method, including DMS, decimal degrees, and custom formats.
   *
   * @param longitudeStr - The longitude string to parse
   * @param latitudeStr - The latitude string to parse
   * @returns A tuple containing [longitude, latitude] as decimal numbers, or null if parsing fails
   *
   * @example
   * ```typescript
   * const formatter = new CoordinateFormat();
   * const coords = formatter.parse("149° 7.721′ E", "35° 16.920′ S");
   * // coords: [149.128683..., -35.282]
   *
   * // Can parse various formats
   * formatter.parse("149° 7′ 43.262″ E", "35° 16′ 55.200″ S");
   * formatter.parse("149.129° E", "35.282° S");
   * formatter.parse("-149 7 43.262", "-35 16 55.200");
   * ```
   */
  parse(longitudeStr: string, latitudeStr: string): [number, number] | null {
    const longitude = this.parseCoordinate(longitudeStr, this.labels.longitude);
    const latitude = this.parseCoordinate(latitudeStr, this.labels.latitude);

    if (longitude === null || latitude === null) {
      return null;
    }

    return [longitude, latitude];
  }

  private parseCoordinate(
    str: string,
    directions: [string, string],
  ): number | null {
    if (!str || typeof str !== "string") {
      return null;
    }

    // Clean up the string - remove extra whitespace
    str = str.trim();

    // Check for direction indicators (N/S/E/W or custom labels)
    let isNegative = false;
    const positiveDir = directions[0];
    const negativeDir = directions[1];

    // Check if direction is at the end
    if (str.endsWith(positiveDir)) {
      str = str.slice(0, -positiveDir.length).trim();
      isNegative = false;
    } else if (str.endsWith(negativeDir)) {
      str = str.slice(0, -negativeDir.length).trim();
      isNegative = true;
    }

    // Check for explicit negative sign at the start
    if (str.startsWith("-")) {
      isNegative = true;
      str = str.slice(1).trim();
    }

    // Normalize various quote and degree symbols
    // Handle both standard ASCII quotes and fancy Unicode quotes
    str = str
      .replace(/['''ʹ]/g, "'") // Normalize various apostrophes/primes to standard single quote
      .replace(/["""]/g, '"') // Normalize various quotes to standard double quote
      .replace(/[ºº]/g, "°"); // Normalize degree symbols

    // Create escape function for regex
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Replace degree, minute, and second symbols with spaces
    // Also handle standard ASCII quotes that might be used for minutes/seconds
    str = str
      .replace(new RegExp(escapeRegex(this.labels.degrees), "g"), " ")
      .replace(new RegExp(escapeRegex(this.labels.minutes), "g"), " ")
      .replace(new RegExp(escapeRegex(this.labels.seconds), "g"), " ")
      .replace(/'/g, " ") // Handle plain apostrophe used for minutes
      .replace(/"/g, " ") // Handle plain double-quote used for seconds
      .replace(/:/g, " ") // Handle colon separators (e.g., 59:12:7.7)
      .replace(/'''/g, " ") // Handle triple apostrophe
      .replace(/''/g, " ") // Handle double apostrophe (used for seconds in some formats)
      .trim();

    // Split by whitespace to get parts
    const parts = str.split(/\s+/).filter((p) => p.length > 0);

    if (parts.length === 0) {
      return null;
    }

    let decimal = 0;

    try {
      if (parts.length === 1) {
        // Just decimal degrees
        decimal = parseFloat(parts[0]);
      } else if (parts.length === 2) {
        // Degrees and decimal minutes
        const degrees = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1]);
        decimal = degrees + minutes / 60;
      } else if (parts.length >= 3) {
        // Degrees, minutes, and seconds
        const degrees = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1]);
        const seconds = parseFloat(parts[2]);
        decimal = degrees + minutes / 60 + seconds / 3600;
      }

      if (isNaN(decimal)) {
        return null;
      }

      return isNegative ? -decimal : decimal;
    } catch (e) {
      return null;
    }
  }

  private formatCoordinate(c: Coordinate) {
    if (isNaN(c.value)) return "";

    interface Match {
      position: number;
      length: number;
      replacement: string;
    }

    // Scan for all matches across all format patterns
    const matches: Match[] = [];
    for (const [pattern, replacer] of CoordinateFormat.formats) {
      // Escape special regex characters and create global regex
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      let match;
      while ((match = regex.exec(this.formatString)) !== null) {
        matches.push({
          position: match.index,
          length: match[0].length,
          replacement: replacer(c, this),
        });
      }
    }

    // Sort matches by position, then by length (descending) to handle overlaps
    // This ensures longer patterns take precedence over shorter ones
    matches.sort((a, b) => {
      return a.position !== b.position
        ? a.position - b.position
        : b.length - a.length;
    });

    // Remove overlapping matches - keep only non-overlapping ones
    const nonOverlapping: Match[] = [];
    let lastEndPosition = -1;
    for (const match of matches) {
      if (match.position >= lastEndPosition) {
        nonOverlapping.push(match);
        lastEndPosition = match.position + match.length;
      }
    }

    // Apply replacements from right to left to preserve positions
    let result = this.formatString;
    for (let i = nonOverlapping.length - 1; i >= 0; i--) {
      const { position, length, replacement } = nonOverlapping[i];
      result =
        result.slice(0, position) +
        replacement +
        result.slice(position + length);
    }

    return result;
  }
}

export * from "./coordinate";
