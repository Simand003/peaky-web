import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { buildTrackData } from "../utils/gpx";

// Distinct peak ids: a peak climbed twice in the same outing appears only once here
const getPeakIds = (peaks) => [...new Set(peaks.map((p) => p.id))];

// The part of the GPX we keep in the climb: a few numbers, not the file itself
function toGpxSummary(stats) {
  if (!stats) return null;
  return {
    distanceM: Math.round(stats.distanceM),
    gainM: Math.round(stats.gainM),
    maxEle: stats.maxEle === null ? null : Math.round(stats.maxEle),
    durationSec: stats.durationSec === null ? null : Math.round(stats.durationSec),
    // Firestore does not accept undefined, so a missing time is stored as null
    startedAt: stats.startTime ? Timestamp.fromDate(stats.startTime) : null,
  };
}

// Saves a new climb in the user's diary. Returns the new document id.
// peaks: array of { id, name, elevation }
// gpx: summary of the track or null. trackPoints: points of the chosen file or null.
export async function addClimb({
  userId,
  peaks,
  climbedAt,
  hasTime,
  notes,
  gpx,
  trackPoints,
}) {
  const batch = writeBatch(db);

  // doc() without an id only prepares a reference with a new random id
  const climbRef = doc(collection(db, "climbs"));

  batch.set(climbRef, {
    userId,
    // Copied from the peaks, so the diary needs no extra reads
    peaks,
    // Plain list of ids: lets us query "all climbs that include peak X"
    peakIds: getPeakIds(peaks),
    climbedAt: Timestamp.fromDate(climbedAt),
    hasTime,
    notes: notes ?? "",
    gpx: toGpxSummary(gpx),
    // These two are fixed by the security rules for now
    isPublic: false,
    verified: false,
    // The server writes the time, so it cannot be faked by the client clock
    createdAt: serverTimestamp(),
  });

  // The track lives in its own document, with the same id as the climb:
  // the diary does not download it, the map will read it only when needed
  if (trackPoints) {
    batch.set(doc(db, "tracks", climbRef.id), {
      userId,
      ...buildTrackData(trackPoints),
    });
  }

  // Both writes happen together or not at all
  await batch.commit();
  return climbRef.id;
}

// Reads the diary of one user, most recent climbs first
export async function fetchUserClimbs(userId) {
  const q = query(
    collection(db, "climbs"),
    where("userId", "==", userId),
    orderBy("climbedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Changes only the editable fields: owner and verified stay untouched.
// trackPoints: points of a NEW file chosen in this edit (null = leave the saved track alone).
// hadGpx: the climb already had a GPX before this edit.
export async function updateClimb(
  climbId,
  { userId, peaks, climbedAt, hasTime, notes, gpx, trackPoints, hadGpx }
) {
  const batch = writeBatch(db);

  batch.update(doc(db, "climbs", climbId), {
    peaks,
    peakIds: getPeakIds(peaks),
    climbedAt: Timestamp.fromDate(climbedAt),
    hasTime,
    notes,
    gpx: toGpxSummary(gpx),
  });

  const trackRef = doc(db, "tracks", climbId);
  if (trackPoints) {
    // New file: replaces the old track (set overwrites the whole document)
    batch.set(trackRef, { userId, ...buildTrackData(trackPoints) });
  } else if (hadGpx && !gpx) {
    // The GPX was removed: its track goes too
    batch.delete(trackRef);
  }

  await batch.commit();
}

// Removes a climb from the diary, together with its track
export async function deleteClimb(climb) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "climbs", climb.id));
  // Only climbs with a GPX can have a track
  if (climb.gpx) batch.delete(doc(db, "tracks", climb.id));
  await batch.commit();
}