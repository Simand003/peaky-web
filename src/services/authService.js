import {
  createUserWithEmailAndPassword,
  deleteUser,
  signOut,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signInWithPopup,
  unlink,
} from "firebase/auth";
import { auth } from "./firebase";

// Creates the account in Firebase Authentication and returns the new user.
// If the email is already used by ANY account (password or Google), Firebase refuses
// and throws an error with code "auth/email-already-in-use".
export async function registerWithEmail(email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
}

// Undoes a registration that was not completed: deletes the account just created.
export async function cancelRegistration() {
    const user = auth.currentUser;
    if (!user) return;
    try {
        await deleteUser(user);
    } catch (error) {
        console.error("Could not delete the account:", error);
        await signOut(auth);
    }    
}

// Logs the current user out
export async function logout() {
  await signOut(auth);
}

// Opens the Google window and registers the user.
// Returns the user if the account was just created.
// Throws an error with code "app/already-registered" if the Google account already existed.
export async function registerWithGoogle() {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());

  // Debug: remove later
console.log(
  "isNewUser:", getAdditionalUserInfo(result)?.isNewUser,
  "uid:", result.user.uid,
  "providers:", result.user.providerData.map((p) => p.providerId)
);

// Debug: remove later
console.log("project:", auth.app.options.projectId, "| authDomain:", auth.app.options.authDomain);
console.log("created:", result.user.metadata.creationTime, "| last sign-in:", result.user.metadata.lastSignInTime);

  // isNewUser is true only if Firebase created the account during this sign-in
  if (getAdditionalUserInfo(result)?.isNewUser) {
    return result.user; // brand new account: the registration can continue
  }

  // Not new: this person already had an account, so they are already registered.
  // Safety: if Firebase linked Google to an account that has another sign-in method
  // (e.g. a password), undo the link so the two methods do not end up mixed.
  const hasOtherProvider = result.user.providerData.some(
    (provider) => provider.providerId !== "google.com"
  );
  if (hasOtherProvider) {
    await unlink(result.user, "google.com");
  }
  await signOut(auth);

  // Our own error: its code starts with "app/" to tell it apart from Firebase's "auth/"
  const error = new Error("This Google account is already registered");
  error.code = "app/already-registered";
  throw error;
}