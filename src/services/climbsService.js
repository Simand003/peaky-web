import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

// Distinct peak ids: a peak climbed twice in the same outing appears only once here
const getPeakIds = (peaks) => [...new Set(peaks.map((p) => p.id))];

// Saves a new climb in the user's diary. Returns the new document id.
// peaks: array of { id, name, elevation }
export async function addClimb({ userId, peaks, climbedAt, hasTime, notes }) {
  const ref = await addDoc(collection(db, "climbs"), {
    userId,
    // Copied from the peaks, so the diary needs no extra reads
    peaks,
    // Plain list of ids: lets us query "all climbs that include peak X"
    peakIds: getPeakIds(peaks),
    climbedAt: Timestamp.fromDate(climbedAt),
    hasTime,
    notes: notes ?? "",
    // These two are fixed by the security rules for now
    isPublic: false,
    verified: false,
    // The server writes the time, so it cannot be faked by the client clock
    createdAt: serverTimestamp(),
  });
  return ref.id;
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

// Removes one climb from the diary
export async function deleteClimb(climbId) {
  await deleteDoc(doc(db, "climbs", climbId));
}

// Changes only the editable fields: owner and verified stay untouched
export async function updateClimb(climbId, { peaks, climbedAt, hasTime, notes }) {
  await updateDoc(doc(db, "climbs", climbId), {
    peaks,
    peakIds: getPeakIds(peaks),
    climbedAt: Timestamp.fromDate(climbedAt),
    hasTime,
    notes,
  });
}