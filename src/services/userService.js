import { doc, setDoc } from "firebase/firestore";
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