import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Favourites live in a subcollection of the user: users/{uid}/favourites/{type}_{itemId}
// type: "peak" now, "refuge" later. The id is always the same for the same item,
// so adding twice never creates a duplicate.
const favouriteRef = (userId, type, itemId) =>
  doc(db, "users", userId, "favourites", `${type}_${itemId}`);

// All the favourites of a user
export async function fetchFavourites(userId) {
  const snap = await getDocs(collection(db, "users", userId, "favourites"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// item: { id, name, elevation }. Name and elevation are copied, so the list
// can be shown without reading the peaks again.
export async function addFavourite(userId, type, item) {
  await setDoc(favouriteRef(userId, type, item.id), {
    type,
    itemId: item.id,
    name: item.name,
    // Firestore does not accept undefined: items without elevation get null
    elevation: item.elevation ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavourite(userId, type, itemId) {
  await deleteDoc(favouriteRef(userId, type, itemId));
}