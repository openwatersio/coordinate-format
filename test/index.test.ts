import { describe, test, expect } from "vitest";
import { CoordinateFormat } from "../src";

describe("format", () => {
  const formatter = new CoordinateFormat();

  test("throws error with invalid arguments", () => {
    // @ts-ignore - testing invalid args
    expect(() => formatter.format()).toThrow(TypeError);
    // @ts-ignore - testing invalid args
    expect(() => formatter.format(1)).toThrow(TypeError);
    // @ts-ignore - testing invalid args
    expect(() => formatter.format(undefined, 1)).toThrow(TypeError);
    expect(() => formatter.format(NaN, 1)).toThrow(TypeError);
  });

  test("accepts [lon, lat] array", () => {
    const [lonStr, latStr] = formatter.format([149.128684, -35.282]);
    expect(lonStr).toBe("149° 7.721′ E");
    expect(latStr).toBe("35° 16.920′ S");
  });

  test("accepts lon, lat arguments", () => {
    const [lonStr, latStr] = formatter.format(149.128684, -35.282);
    expect(lonStr).toBe("149° 7.721′ E");
    expect(latStr).toBe("35° 16.920′ S");
  });

  test("renders seconds format by default", () => {
    const formatter = new CoordinateFormat("seconds");
    const [lonStr, latStr] = formatter.format(149.128684, -35.282);
    expect(lonStr).toBe("149° 7′ 43.262″ E");
    expect(latStr).toBe("35° 16′ 55.200″ S");
  });

  test("renders minutes format", () => {
    const formatter = new CoordinateFormat("minutes");
    const [lonStr, latStr] = formatter.format(149.128684, -35.282);
    expect(lonStr).toBe("149° 7.721′ E");
    expect(latStr).toBe("35° 16.920′ S");
  });

  test("renders degrees format", () => {
    const formatter = new CoordinateFormat("degrees");
    const [lonStr, latStr] = formatter.format(149.128684, -35.282);
    expect(lonStr).toBe("149.129° E");
    expect(latStr).toBe("35.282° S");
  });

  test("supports custom format strings", () => {
    const formatter = new CoordinateFormat("-D M s");
    const [lonStr, latStr] = formatter.format(149.128684, -35.282);
    expect(lonStr).toBe("149 7 43.262");
    expect(latStr).toBe("-35 16 55.200");
  });

  test("supports custom precision", () => {
    const formatter = new CoordinateFormat("seconds", { precision: 0 });
    const [lonStr, latStr] = formatter.format(149.128684, -35.282);
    expect(lonStr).toBe("149° 7′ 43″ E");
    expect(latStr).toBe("35° 16′ 55″ S");
  });

  describe("tokens", () => {
    const examples = [
      ["degrees", 1.1111111, "1.111° E"],
      ["minutes", 1.1111111, "1° 6.667′ E"],
      ["seconds", 1.1111111, "1° 6′ 40.000″ E"],
    ] as const;

    examples.forEach(([alias, value, expected]) => {
      test("format alias: " + alias, () => {
        const formatter = new CoordinateFormat(alias);
        const actual = formatter.longitude(value);
        expect(actual).toBe(expected);
      });
    });

    test('defaults to "minutes" format', () => {
      const formatter = new CoordinateFormat();
      const actual = formatter.longitude(1.1111111);
      expect(actual).toBe("1° 6.667′ E");
    });

    test("DD - integer degrees with label", () => {
      const formatter = new CoordinateFormat("DD");
      expect(formatter.latitude(35.282)).toBe("35°");
      expect(formatter.latitude(35.999)).toBe("35°");
    });

    test("dd - decimal degrees with label", () => {
      const formatter = new CoordinateFormat("dd");
      expect(formatter.latitude(35.282)).toBe("35.282°");
    });

    test("D - integer degrees without label", () => {
      const formatter = new CoordinateFormat("D");
      expect(formatter.latitude(35.282)).toBe("35");
      expect(formatter.latitude(35.999)).toBe("35");
    });

    test("d - decimal degrees without label", () => {
      const formatter = new CoordinateFormat("d");
      expect(formatter.latitude(35.282)).toBe("35.282");
    });

    test("dd respects custom precision", () => {
      const formatter = new CoordinateFormat("dd", { precision: 5 });
      expect(formatter.latitude(35.282)).toBe("35.28200°");
    });

    test("MM - integer minutes with label", () => {
      const formatter = new CoordinateFormat("MM");
      expect(formatter.latitude(35.282)).toBe("16′");
    });

    test("mm - decimal minutes with label", () => {
      const formatter = new CoordinateFormat("mm");
      expect(formatter.latitude(35.282)).toBe("16.920′");
    });

    test("M - integer minutes without label", () => {
      const formatter = new CoordinateFormat("M");
      expect(formatter.latitude(35.282)).toBe("16");
    });

    test("m - decimal minutes without label", () => {
      const formatter = new CoordinateFormat("m");
      expect(formatter.latitude(35.282)).toBe("16.920");
    });

    test("mm respects custom precision", () => {
      const formatter = new CoordinateFormat("mm", { precision: 1 });
      expect(formatter.latitude(35.282)).toBe("16.9′");
    });

    test("ss - decimal seconds with label", () => {
      const formatter = new CoordinateFormat("ss");
      expect(formatter.latitude(35.282)).toBe("55.200″");
    });

    test("s - decimal seconds without label", () => {
      const formatter = new CoordinateFormat("s");
      expect(formatter.latitude(35.282)).toBe("55.200");
    });

    test("ss respects custom precision", () => {
      const formatter = new CoordinateFormat("ss", { precision: 1 });
      expect(formatter.latitude(35.282)).toBe("55.2″");
    });

    test("- shows negative sign for negative values", () => {
      const formatter = new CoordinateFormat("-D");
      expect(formatter.latitude(-35.282)).toBe("-35");
      expect(formatter.longitude(-149.128684)).toBe("-149");
    });

    test("- shows nothing for positive values", () => {
      const formatter = new CoordinateFormat("-D");
      expect(formatter.latitude(35.282)).toBe("35");
      expect(formatter.longitude(149.128684)).toBe("149");
    });

    test("- shows nothing for zero", () => {
      const formatter = new CoordinateFormat("-D");
      expect(formatter.latitude(0)).toBe("0");
    });

    test("X shows direction based on positive/negative", () => {
      const formatter = new CoordinateFormat("X");
      expect(formatter.latitude(0)).toBe("N");
      expect(formatter.longitude(0)).toBe("E");
      expect(formatter.latitude(35.282)).toBe("N");
      expect(formatter.latitude(-35.282)).toBe("S");
      expect(formatter.longitude(149.128684)).toBe("E");
      expect(formatter.longitude(-149.128684)).toBe("W");
    });

    test("DD MM ss X - full DMS with labels", () => {
      const formatter = new CoordinateFormat("DD MM ss X");
      expect(formatter.latitude(35.282)).toBe("35° 16′ 55.200″ N");
      expect(formatter.latitude(-35.282)).toBe("35° 16′ 55.200″ S");
    });

    test("DD mm X - degrees and decimal minutes", () => {
      const formatter = new CoordinateFormat("DD mm X");
      expect(formatter.latitude(35.282)).toBe("35° 16.920′ N");
    });

    test("dd X - decimal degrees only", () => {
      const formatter = new CoordinateFormat("dd X");
      expect(formatter.latitude(35.282)).toBe("35.282° N");
    });

    test("-D M s - GPS style format", () => {
      const formatter = new CoordinateFormat("-D M s");
      expect(formatter.latitude(-35.282)).toBe("-35 16 55.200");
      expect(formatter.longitude(149.128684)).toBe("149 7 43.262");
    });

    test("D° M′ s″ X - custom labels mixed with tokens", () => {
      const formatter = new CoordinateFormat("D° M′ s″ X");
      expect(formatter.latitude(35.282)).toBe("35° 16′ 55.200″ N");
    });

    test("mixed precision in different parts", () => {
      const formatter = new CoordinateFormat("DD MM ss", { precision: 2 });
      expect(formatter.latitude(35.282)).toBe("35° 16′ 55.20″");
    });

    test("custom labels with single characters now work correctly", () => {
      const formatter = new CoordinateFormat("DD MM ss X", {
        labels: {
          degrees: "d",
          minutes: "m",
          seconds: "s",
          latitude: ["Norte", "Sur"],
        },
      });
      expect(formatter.latitude(35.282)).toBe("35d 16m 55.200s Norte");
    });

    test("custom labels with multi-character strings work correctly", () => {
      const formatter = new CoordinateFormat("X", {
        labels: {
          latitude: ["Norte", "Sur"],
          longitude: ["Este", "Oeste"],
        },
      });
      expect(formatter.latitude(35.282)).toBe("Norte");
      expect(formatter.latitude(-35.282)).toBe("Sur");
      expect(formatter.longitude(149.128684)).toBe("Este");
      expect(formatter.longitude(-149.128684)).toBe("Oeste");
    });

    test("handles zero correctly", () => {
      const formatter = new CoordinateFormat("DD MM ss X");
      expect(formatter.latitude(0)).toBe("0° 0′ 0.000″ N");
      expect(formatter.longitude(0)).toBe("0° 0′ 0.000″ E");
    });

    test("handles very small values", () => {
      const formatter = new CoordinateFormat("DD MM ss");
      expect(formatter.latitude(0.001)).toBe("0° 0′ 3.600″");
    });

    test("handles values near 180", () => {
      const formatter = new CoordinateFormat("DD MM ss X");
      expect(formatter.longitude(179.999)).toBe("179° 59′ 56.400″ E");
    });

    test("returns empty string for NaN", () => {
      const formatter = new CoordinateFormat("DD MM ss X");
      expect(formatter.latitude(NaN)).toBe("");
    });
  });
});

describe("parse", () => {
  test("parses seconds format (DMS)", () => {
    const formatter = new CoordinateFormat("seconds");
    const result = formatter.parse("149° 7′ 43.262″ E", "35° 16′ 55.200″ S");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeCloseTo(149.128684, 5);
    expect(lat).toBeCloseTo(-35.282, 5);
  });

  test("parses minutes format", () => {
    const formatter = new CoordinateFormat("minutes");
    const result = formatter.parse("149° 7.721′ E", "35° 16.920′ S");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeCloseTo(149.128683, 5);
    expect(lat).toBeCloseTo(-35.282, 5);
  });

  test("parses degrees format", () => {
    const formatter = new CoordinateFormat("degrees");
    const result = formatter.parse("149.129° E", "35.282° S");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeCloseTo(149.129, 3);
    expect(lat).toBeCloseTo(-35.282, 3);
  });

  test("parses format with negative sign", () => {
    const formatter = new CoordinateFormat("-D M s");
    const result = formatter.parse("149 7 43.262", "-35 16 55.200");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeCloseTo(149.128684, 5);
    expect(lat).toBeCloseTo(-35.282, 5);
  });

  test("parses format without direction or sign", () => {
    const formatter = new CoordinateFormat("D M s");
    const result = formatter.parse("149 7 43.262", "35 16 55.200");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeCloseTo(149.128684, 5);
    expect(lat).toBeCloseTo(35.282, 5);
  });

  test("parses decimal degrees without labels", () => {
    const formatter = new CoordinateFormat("d");
    const result = formatter.parse("149.128684", "35.282");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeCloseTo(149.128684, 6);
    expect(lat).toBeCloseTo(35.282, 3);
  });

  test("parses with custom labels", () => {
    const formatter = new CoordinateFormat("DD MM ss X", {
      labels: {
        latitude: ["Norte", "Sur"],
        longitude: ["Este", "Oeste"],
        degrees: "d",
        minutes: "m",
        seconds: "s",
      },
    });
    const result = formatter.parse(
      "149d 7m 43.262s Este",
      "35d 16m 55.200s Sur",
    );
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeCloseTo(149.128684, 5);
    expect(lat).toBeCloseTo(-35.282, 5);
  });

  test("handles zero coordinates", () => {
    const formatter = new CoordinateFormat("seconds");
    const result = formatter.parse("0° 0′ 0.000″ E", "0° 0′ 0.000″ N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBe(0);
    expect(lat).toBe(0);
  });

  test("handles coordinates near 180", () => {
    const formatter = new CoordinateFormat("seconds");
    const result = formatter.parse("179° 59′ 59.999″ E", "89° 59′ 59.999″ N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeCloseTo(179.99999972, 6);
    expect(lat).toBeCloseTo(89.99999972, 6);
  });

  test("returns null for invalid input", () => {
    const formatter = new CoordinateFormat("seconds");
    expect(formatter.parse("", "35° 16′ 55.200″ S")).toBeNull();
    expect(formatter.parse("149° 7′ 43.262″ E", "")).toBeNull();
    expect(formatter.parse("invalid", "35° 16′ 55.200″ S")).toBeNull();
  });

  test("returns null for non-string input", () => {
    const formatter = new CoordinateFormat("seconds");
    // @ts-ignore - testing invalid input
    expect(formatter.parse(null, "35° 16′ 55.200″ S")).toBeNull();
    // @ts-ignore - testing invalid input
    expect(formatter.parse("149° 7′ 43.262″ E", undefined)).toBeNull();
  });

  test("round-trip formatting and parsing", () => {
    const formatter = new CoordinateFormat("seconds", { precision: 3 });
    const original: [number, number] = [149.128684, -35.282];
    const [lonStr, latStr] = formatter.format(original);
    const parsed = formatter.parse(lonStr, latStr);
    expect(parsed).not.toBeNull();
    const [lon, lat] = parsed!;
    expect(lon).toBeCloseTo(original[0], 5);
    expect(lat).toBeCloseTo(original[1], 5);
  });

  test("round-trip with minutes format", () => {
    const formatter = new CoordinateFormat("minutes", { precision: 3 });
    const original: [number, number] = [149.128684, -35.282];
    const [lonStr, latStr] = formatter.format(original);
    const parsed = formatter.parse(lonStr, latStr);
    expect(parsed).not.toBeNull();
    const [lon, lat] = parsed!;
    expect(lon).toBeCloseTo(original[0], 5);
    expect(lat).toBeCloseTo(original[1], 5);
  });

  test("round-trip with degrees format", () => {
    const formatter = new CoordinateFormat("degrees", { precision: 3 });
    const original: [number, number] = [149.129, -35.282];
    const [lonStr, latStr] = formatter.format(original);
    const parsed = formatter.parse(lonStr, latStr);
    expect(parsed).not.toBeNull();
    const [lon, lat] = parsed!;
    expect(lon).toBeCloseTo(original[0], 3);
    expect(lat).toBeCloseTo(original[1], 3);
  });

  test("parses DMS with different separators", () => {
    const formatter = new CoordinateFormat("seconds");
    const testData = [
      ["59°12'7.7\"N", "02°15'39.6\"W"],
      ["59º12'7.7\"N", "02º15'39.6\"W"],
      ["59 12' 7.7\" N", "02 15' 39.6\" W"],
      ['59:12:7.7"N', "2:15:39.6W"],
    ];
    const expectedLat = 59 + 12 / 60 + 7.7 / 3600;
    const expectedLon = -1 * (2 + 15 / 60 + 39.6 / 3600);

    for (const [latStr, lonStr] of testData) {
      const result = formatter.parse(lonStr, latStr);
      expect(result).not.toBeNull();
      const [lon, lat] = result!;
      expect(lat).toBeCloseTo(expectedLat, 6);
      expect(lon).toBeCloseTo(expectedLon, 6);
    }
  });

  test("parses DMS with decimal minutes", () => {
    const formatter = new CoordinateFormat("minutes");
    const testData = [
      ["59°12.105' N", "02°15.66' W"],
      ["59:12.105' N", "02:15.66' W"],
      ["59:12.105 N", "02:15.66 W"],
    ];
    const expectedLat = 59 + 12.105 / 60;
    const expectedLon = -1 * (2 + 15.66 / 60);

    for (const [latStr, lonStr] of testData) {
      const result = formatter.parse(lonStr, latStr);
      expect(result).not.toBeNull();
      const [lon, lat] = result!;
      expect(lat).toBeCloseTo(expectedLat, 6);
      expect(lon).toBeCloseTo(expectedLon, 6);
    }
  });

  test("parses DMS with no minutes or seconds", () => {
    const formatter = new CoordinateFormat("degrees");
    const result = formatter.parse("02°W", "59°N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lat).toBe(59);
    expect(lon).toBe(-2);
  });

  test("parses decimal degrees", () => {
    const formatter = new CoordinateFormat("degrees");
    const testData = [
      ["51.5", "-0.126"],
      ["51.5", "-0.126"],
    ];
    const expectedLat = 51.5;
    const expectedLon = -0.126;

    for (const [latStr, lonStr] of testData) {
      const result = formatter.parse(lonStr, latStr);
      expect(result).not.toBeNull();
      const [lon, lat] = result!;
      expect(lat).toBeCloseTo(expectedLat, 3);
      expect(lon).toBeCloseTo(expectedLon, 3);
    }
  });

  test("parses coordinates with extra spaces", () => {
    const formatter = new CoordinateFormat("seconds");
    const testData = [
      ["59° 12' 7.7\" N", "02° 15' 39.6\" W"],
      ["59º 12' 7.7\" N", "02º 15' 39.6\" W"],
    ];
    const expectedLat = 59 + 12 / 60 + 7.7 / 3600;
    const expectedLon = -1 * (2 + 15 / 60 + 39.6 / 3600);

    for (const [latStr, lonStr] of testData) {
      const result = formatter.parse(lonStr, latStr);
      expect(result).not.toBeNull();
      const [lon, lat] = result!;
      expect(lat).toBeCloseTo(expectedLat, 6);
      expect(lon).toBeCloseTo(expectedLon, 6);
    }
  });

  test("parses with colon separators", () => {
    const formatter = new CoordinateFormat("seconds");
    const result = formatter.parse("2:15:39.6W", "59:12:7.7N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    const expectedLat = 59 + 12 / 60 + 7.7 / 3600;
    const expectedLon = -1 * (2 + 15 / 60 + 39.6 / 3600);
    expect(lat).toBeCloseTo(expectedLat, 6);
    expect(lon).toBeCloseTo(expectedLon, 6);
  });

  test("handles missing seconds", () => {
    const formatter = new CoordinateFormat("minutes");
    const result = formatter.parse("02°15'W", "59°12'N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    const expectedLat = 59 + 12 / 60;
    const expectedLon = -1 * (2 + 15 / 60);
    expect(lat).toBeCloseTo(expectedLat, 6);
    expect(lon).toBeCloseTo(expectedLon, 6);
  });

  test("handles missing minutes and seconds", () => {
    const formatter = new CoordinateFormat("degrees");
    const result = formatter.parse("02°W", "59°N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lat).toBe(59);
    expect(lon).toBe(-2);
  });

  test("parses very small decimal values", () => {
    const formatter = new CoordinateFormat("degrees");
    const result = formatter.parse("0.001° E", "0.001° N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lat).toBeCloseTo(0.001, 6);
    expect(lon).toBeCloseTo(0.001, 6);
  });

  test("parses high precision seconds", () => {
    const formatter = new CoordinateFormat("seconds", { precision: 6 });
    const result = formatter.parse("2°15'39.123456\" W", "59°12'7.654321\" N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    const expectedLat = 59 + 12 / 60 + 7.654321 / 3600;
    const expectedLon = -1 * (2 + 15 / 60 + 39.123456 / 3600);
    expect(lat).toBeCloseTo(expectedLat, 8);
    expect(lon).toBeCloseTo(expectedLon, 8);
  });

  test("handles positive directions correctly", () => {
    const formatter = new CoordinateFormat("seconds");
    const result = formatter.parse("149°7'43.262\" E", "35°16'55.200\" N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeGreaterThan(0);
    expect(lat).toBeGreaterThan(0);
  });

  test("handles negative directions correctly", () => {
    const formatter = new CoordinateFormat("seconds");
    const result = formatter.parse("149°7'43.262\" W", "35°16'55.200\" S");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBeLessThan(0);
    expect(lat).toBeLessThan(0);
  });

  test("parses integer degrees without decimal point", () => {
    const formatter = new CoordinateFormat("degrees");
    const result = formatter.parse("149° E", "35° N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    expect(lon).toBe(149);
    expect(lat).toBe(35);
  });

  test("parses integer minutes without decimal point", () => {
    const formatter = new CoordinateFormat("minutes");
    const result = formatter.parse("149°7' E", "35°16' N");
    expect(result).not.toBeNull();
    const [lon, lat] = result!;
    const expectedLat = 35 + 16 / 60;
    const expectedLon = 149 + 7 / 60;
    expect(lat).toBeCloseTo(expectedLat, 6);
    expect(lon).toBeCloseTo(expectedLon, 6);
  });

  test("parses with mixed spacing", () => {
    const formatter = new CoordinateFormat("seconds");
    const testData = [
      ["59°12'7.7\"N", "2°15'39.6\"W"],
      ["59° 12' 7.7\" N", "2° 15' 39.6\" W"],
      ["59°  12'  7.7\"  N", "2°  15'  39.6\"  W"],
    ];
    const expectedLat = 59 + 12 / 60 + 7.7 / 3600;
    const expectedLon = -1 * (2 + 15 / 60 + 39.6 / 3600);

    for (const [latStr, lonStr] of testData) {
      const result = formatter.parse(lonStr, latStr);
      expect(result).not.toBeNull();
      const [lon, lat] = result!;
      expect(lat).toBeCloseTo(expectedLat, 6);
      expect(lon).toBeCloseTo(expectedLon, 6);
    }
  });
});
