import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Saves the user's profile in the "users" collection of Firestore.
// The document id is the user's uid, so each account has exactly one profile.
// Field names (birth_date, userId...) match the ones of the old Android app.
export async function saveUserProfile(user, { name, surname, gender, birthDate}) {
    await setDoc(doc(db, "users", user.uid), {
        userId: user.uid,
        email: user.email,
        name,
        surname,
        gender,
        birth_date: birthDate,
    });
}

export async function userProfileExists(uid) {
    const snapshot = await getDoc(doc(db, "users", uid));
    return snapshot.exists();
}

// Listens to the user's profile in real time.
// onChange is called now and every time the profile is created or changed:
// with the profile data, or with null if it does not exist yet.
// Returns a function that stops listening.
export function subscribeToUserProfile(uid, onChange) {
  return onSnapshot(
    doc(db, "users", uid),
    (snapshot) => onChange(snapshot.exists() ? snapshot.data() : null),
    (error) => console.error("Could not read the profile:", error)
  );
}