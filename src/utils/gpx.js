const EARTH_RADIUS_M = 6371000;
// Elevation changes smaller than this are treated as GPS noise, not real climbing
const ELEVATION_NOISE_M = 3;

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

// Distance from point p to the segment a-b (all in meters, flat coordinates)
function distanceToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  // a and b coincide: plain distance to a
  if (lengthSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);

  // Where the projection of p falls on the line a-b: 0 = at a, 1 = at b.
  // Clamped to [0, 1] so we measure to the segment, not to the infinite line.
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq)
  );
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
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