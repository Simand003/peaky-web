import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// Saves a new climb in the user's diary. Returns the new document id.
export async function addClimb({ userId, peak, climbedAt, hasTime, report }) {
  const ref = await addDoc(collection(db, "climbs"), {
    userId,
    peakId: peak.id,
    // Copied from the peak so the diary can show them without reading peaks
    peakName: peak.name,
    peakElevation: peak.elevation,
    // JS Date -> Firestore Timestamp
    climbedAt: Timestamp.fromDate(climbedAt),
    hasTime,
    report: report ?? "",
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