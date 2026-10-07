import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

// Custom hook: returns { user, loading }.
// user: the Firebase user, or null if nobody is logged in.
// loading: true until Firebase has answered the first time (restoring the saved session).
export default function useAuth() {
  // One state object, so user and loading always change together
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
    // Called once at startup (after Firebase checks the saved session)
    // and again every time someone logs in or out.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setState({ user: firebaseUser, loading: false });
    });

    // Runs when the component disappears: stop listening
    return unsubscribe;
  }, []);

  return state;
}