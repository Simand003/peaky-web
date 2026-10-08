const EARTH_RADIUS_M = 6371000;
// Elevation changes smaller than this are treated as GPS noise, not real climbing
const ELEVATION_NOISE_M = 3;
import { PEAK_PASS_TOLERANCE_M } from "../constants/map";

const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Distance in meters between two points (haversine formula: distance on a sphere)
function distanceBetween(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Text inside the first child tag with this name, or null if it is missing
function readTag(node, tagName) {
  const child = node.getElementsByTagName(tagName)[0];
  return child ? child.textContent.trim() : null;
}

function computeStats(points) {
  let distanceM = 0;
  let gainM = 0;
  let maxEle = null;
  // Last elevation we counted: small wiggles around it are ignored
  let referenceEle = null;

  points.forEach((p, i) => {
    if (i > 0) distanceM += distanceBetween(points[i - 1], p);

    if (p.ele !== null && Number.isFinite(p.ele)) {
      maxEle = maxEle === null ? p.ele : Math.max(maxEle, p.ele);

      if (referenceEle === null) {
        referenceEle = p.ele;
      } else if (Math.abs(p.ele - referenceEle) >= ELEVATION_NOISE_M) {
        if (p.ele > referenceEle) gainM += p.ele - referenceEle;
        referenceEle = p.ele;
      }
    }
  });

  // Only valid timestamps
  const times = points
    .map((p) => p.time)
    .filter((t) => t && !Number.isNaN(t.getTime()));
  const startTime = times[0] ?? null;
  const endTime = times.at(-1) ?? null;
  // Total elapsed time, pauses included (not "moving time")
  const durationSec = startTime && endTime ? (endTime - startTime) / 1000 : null;

  return { distanceM, gainM, maxEle, startTime, durationSec };
}

// Reads the text of a .gpx file. Returns { points, stats } or throws a readable Error.
export function parseGpx(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("This file is not a valid GPX.");
  }

  const points = [...doc.getElementsByTagName("trkpt")]
    .map((node) => {
      const ele = readTag(node, "ele");
      const time = readTag(node, "time");
      return {
        lat: Number(node.getAttribute("lat")),
        lon: Number(node.getAttribute("lon")),
        ele: ele === null ? null : Number(ele),
        time: time === null ? null : new Date(time),
      };
    })
    // Drop points with broken coordinates
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));

  if (points.length < 2) {
    throw new Error("No recorded track found in this file.");
  }

  return { points, stats: computeStats(points) };
}

export function formatDistance(meters) {
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

const METERS_PER_DEGREE = 111320;
// Starting tolerance of the simplification, in meters
const START_TOLERANCE_M = 3;

// Closest point of the segment a-b to the point p (all in meters, flat coordinates).
// Returns the distance and t: where that point falls on the segment (0 = at a, 1 = at b).
function projectOnSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;

  // Clamped to [0, 1] so we measure to the segment, not to the infinite line.
  // If a and b coincide there is nothing to project: t = 0.
  const t =
    lengthSq === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq)
        );

  return {
    t,
    distance: Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)),
  };
}

// Distance from point p to the segment a-b
function distanceToSegment(p, a, b) {
  return projectOnSegment(p, a, b).distance;
}

// One pass of Ramer-Douglas-Peucker. Returns a flag per point: 1 = keep it.
function simplifyOnce(xy, tolerance) {
  const keep = new Uint8Array(xy.length);
  keep[0] = 1;
  keep[xy.length - 1] = 1;

  // Ranges still to check. A stack instead of recursion: tracks can have
  // tens of thousands of points and deep recursion could crash.
  const stack = [[0, xy.length - 1]];
  while (stack.length > 0) {
    const [start, end] = stack.pop();

    // Find the point farthest from the straight line start-end
    let maxDistance = 0;
    let farthest = -1;
    for (let i = start + 1; i < end; i++) {
      const d = distanceToSegment(xy[i], xy[start], xy[end]);
      if (d > maxDistance) {
        maxDistance = d;
        farthest = i;
      }
    }

    // Far enough: keep it and check the two halves around it
    if (maxDistance > tolerance) {
      keep[farthest] = 1;
      stack.push([start, farthest], [farthest, end]);
    }
  }
  return keep;
}

// Reduces the track to at most maxPoints points, keeping its shape
export function simplifyTrack(points, maxPoints = 800) {
  if (points.length <= maxPoints) return points;

  // On the scale of a hike the Earth can be treated as flat:
  // lat/lon become x/y in meters, measured from the first point
  const lat0 = points[0].lat;
  const lon0 = points[0].lon;
  const cosLat = Math.cos(toRadians(lat0));
  const xy = points.map((p) => ({
    x: (p.lon - lon0) * cosLat * METERS_PER_DEGREE,
    y: (p.lat - lat0) * METERS_PER_DEGREE,
  }));

  // Too many points left? Raise the tolerance by 50% and try again
  for (let tolerance = START_TOLERANCE_M; ; tolerance *= 1.5) {
    const keep = simplifyOnce(xy, tolerance);
    const result = points.filter((_, i) => keep[i]);
    if (result.length <= maxPoints) return result;
  }
}

// One number -> text. Part of the "encoded polyline" format (precision: 5 decimals).
function encodeNumber(value) {
  // Zigzag: the sign goes in the lowest bit, so small negatives stay small
  let n = value < 0 ? ~(value << 1) : value << 1;
  let out = "";
  // 5 bits at a time, lowest first; 0x20 flags "more chunks follow"
  while (n >= 0x20) {
    out += String.fromCharCode((0x20 | (n & 0x1f)) + 63);
    n >>= 5;
  }
  return out + String.fromCharCode(n + 63);
}

// Points -> one compact string. Each point is stored as the DIFFERENCE from the previous.
export function encodePolyline(points) {
  let previousLat = 0;
  let previousLon = 0;
  let result = "";
  for (const p of points) {
    const lat = Math.round(p.lat * 1e5);
    const lon = Math.round(p.lon * 1e5);
    result += encodeNumber(lat - previousLat) + encodeNumber(lon - previousLon);
    previousLat = lat;
    previousLon = lon;
  }
  return result;
}

// The reverse: string -> list of [lat, lon] (we will use it to draw the track)
export function decodePolyline(text) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lon = 0;

  // Reads one number starting at `index`
  function readNumber() {
    let result = 0;
    let shift = 0;
    let chunk;
    do {
      chunk = text.charCodeAt(index++) - 63;
      result |= (chunk & 0x1f) << shift;
      shift += 5;
    } while (chunk >= 0x20);
    // Undo the zigzag
    return result & 1 ? ~(result >> 1) : result >> 1;
  }

  while (index < text.length) {
    lat += readNumber();
    lon += readNumber();
    points.push([lat / 1e5, lon / 1e5]);
  }
  return points;
}

// What we store in Firestore for a track: a compact version of the points
export function buildTrackData(points, maxPoints = 800) {
  const simplified = simplifyTrack(points, maxPoints);
  // Number.isFinite(null) is false, so one point without elevation is enough to skip it
  const hasElevation = simplified.every((p) => Number.isFinite(p.ele));
  return {
    polyline: encodePolyline(simplified),
    pointCount: simplified.length,
    // Elevation (meters) of each stored point, or an empty list if the file lacks it
    elevations: hasElevation ? simplified.map((p) => Math.round(p.ele)) : [],
  };
}

// Reads a File as text. FileReader works in every browser (file.text() is newer)
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Cannot read this file."));
    reader.readAsText(file);
  });
}

// Time between two track points, at fraction t of the way. Null if a time is missing.
function interpolateTime(a, b, t) {
  const valid = (d) => d instanceof Date && !Number.isNaN(d.getTime());
  if (!valid(a) || !valid(b)) return null;
  return new Date(a.getTime() + (b.getTime() - a.getTime()) * t);
}

// Finds every time the track passes within toleranceM of a peak.
// Returns the passes in track order: [{ distanceM, time }, ...]
export function findPeakPasses(points, peak, toleranceM = PEAK_PASS_TOLERANCE_M) {
  const cosLat = Math.cos(toRadians(peak.lat));
  // Track points as flat meters, with the peak as the origin (0, 0)
  const xy = points.map((p) => ({
    x: (p.lon - peak.lon) * cosLat * METERS_PER_DEGREE,
    y: (p.lat - peak.lat) * METERS_PER_DEGREE,
  }));
  const origin = { x: 0, y: 0 };
  // To start a NEW pass the track must first get farther than this
  const leaveM = toleranceM * 2;

  const passes = [];
  let current = null; // the pass in progress

  for (let i = 0; i < points.length - 1; i++) {
    const { t, distance } = projectOnSegment(origin, xy[i], xy[i + 1]);

    if (distance <= toleranceM) {
      if (!current) current = { distanceM: Infinity, time: null };
      // Inside one pass we keep the closest approach
      if (distance < current.distanceM) {
        current.distanceM = distance;
        current.time = interpolateTime(points[i].time, points[i + 1].time, t);
      }
    } else if (current && distance > leaveM) {
      passes.push(current);
      current = null;
    }
  }
  if (current) passes.push(current);

  return passes;
}

// For every entry of the climb: did the track pass by that peak?
// entries: the climb's peaks ({ id, ... }). allPeaks: peaks.json (it has the coordinates).
export function matchPeaksToTrack(entries, allPeaks, points) {
  // Passes found for each peak id, and how many were already given to an entry
  const passesById = new Map();
  const usedById = new Map();

  return entries.map((entry) => {
    if (!passesById.has(entry.id)) {
      const peak = allPeaks.find((p) => p.id === entry.id);
      passesById.set(entry.id, peak ? findPeakPasses(points, peak) : []);
    }

    // The 1st entry of a peak gets its 1st pass, the 2nd entry the 2nd pass...
    const index = usedById.get(entry.id) ?? 0;
    usedById.set(entry.id, index + 1);
    const pass = passesById.get(entry.id)[index];

    return pass
      ? { matched: true, distanceM: Math.round(pass.distanceM), time: pass.time }
      : { matched: false, distanceM: null, time: null };
  });
}