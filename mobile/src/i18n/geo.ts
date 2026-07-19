// Offline coordinates -> country lookup: point-in-polygon over the bundled world-atlas 110m
// countries TopoJSON (~90 KB). No network involved — GPS itself is satellite reception, and the
// map ships in the app, so the whole chain works with zero connectivity.
//
// Resolution is coarse (~tens of km at borders/coasts); a null result (ocean, border sliver,
// unsupported country) simply defers to the next layer of the emergency-number fallback chain.
import { feature } from "topojson-client";

import { COUNTRIES } from "./emergency";

// world-atlas identifies countries by ISO 3166-1 numeric ids; map the countries we serve to
// alpha-2. Unlisted ids resolve to null and fall through to device-region / 112 — which is the
// same answer the emergency table would give anyway.
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  "356": "IN", "840": "US", "124": "CA", "484": "MX", "076": "BR", "032": "AR",
  "152": "CL", "170": "CO", "604": "PE", "826": "GB", "372": "IE", "250": "FR",
  "276": "DE", "380": "IT", "724": "ES", "620": "PT", "528": "NL", "056": "BE",
  "040": "AT", "756": "CH", "752": "SE", "578": "NO", "208": "DK", "246": "FI",
  "616": "PL", "203": "CZ", "300": "GR", "348": "HU", "642": "RO", "792": "TR",
  "643": "RU", "804": "UA", "156": "CN", "392": "JP", "410": "KR", "158": "TW",
  "344": "HK", "702": "SG", "458": "MY", "764": "TH", "704": "VN", "608": "PH",
  "360": "ID", "116": "KH", "104": "MM", "050": "BD", "586": "PK", "144": "LK",
  "524": "NP", "004": "AF", "064": "BT", "462": "MV", "682": "SA", "784": "AE",
  "634": "QA", "512": "OM", "048": "BH", "376": "IL", "400": "JO", "364": "IR",
  "368": "IQ", "818": "EG", "504": "MA", "788": "TN", "710": "ZA", "566": "NG",
  "404": "KE", "288": "GH", "036": "AU", "554": "NZ", "242": "FJ",
};

type Ring = [number, number][]; // [lon, lat]
interface CountryShape {
  iso: string;
  rings: Ring[];
  // cheap bounding box so most countries are skipped without ray casting
  minLon: number; maxLon: number; minLat: number; maxLat: number;
}

let index: CountryShape[] | null = null;

function ringsOf(geom: { type: string; coordinates: unknown }): Ring[] {
  if (geom.type === "Polygon") return geom.coordinates as Ring[];
  if (geom.type === "MultiPolygon") return (geom.coordinates as Ring[][]).flat();
  return [];
}

function buildIndex(): CountryShape[] {
  // Lazy require keeps the 90 KB JSON out of memory until the first lookup.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const topology = require("world-atlas/countries-110m.json");
  const fc = feature(topology, topology.objects.countries) as unknown as {
    features: { id?: string | number; geometry: { type: string; coordinates: unknown } }[];
  };
  const shapes: CountryShape[] = [];
  for (const f of fc.features) {
    const iso = NUMERIC_TO_ALPHA2[String(f.id ?? "").padStart(3, "0")];
    if (!iso || !f.geometry) continue;
    const rings = ringsOf(f.geometry);
    if (rings.length === 0) continue;
    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
    for (const ring of rings) {
      for (const [lon, lat] of ring) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
    shapes.push({ iso, rings, minLon, maxLon, minLat, maxLat });
  }
  return shapes;
}

/** Even-odd ray casting: counts crossings across all rings (outer boundaries + holes). */
function contains(shape: CountryShape, lon: number, lat: number): boolean {
  let inside = false;
  for (const ring of shape.rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
}

/** ISO alpha-2 for the country containing the coordinates, or null (ocean / unsupported). */
export function countryFromCoords(latitude: number, longitude: number): string | null {
  if (!index) index = buildIndex();
  for (const shape of index) {
    if (
      longitude < shape.minLon || longitude > shape.maxLon ||
      latitude < shape.minLat || latitude > shape.maxLat
    ) {
      continue;
    }
    if (contains(shape, longitude, latitude)) return shape.iso;
  }
  return null;
}

/** Sanity guard used by tests: every mapped country must exist in the emergency table. */
export function mappedIsoCodes(): string[] {
  return Object.values(NUMERIC_TO_ALPHA2).filter((iso) => iso in COUNTRIES);
}
