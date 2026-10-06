import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

// Custom hook: returns the user currently logged in with Firebase, or null if nobody is.
// It updates by itself every time someone logs in or out.
export default function useAuth() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // onAuthStateChanged calls our function once at startup (Firebase restores the
    // previous session, if any) and again every time the login state changes.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // a user object, or null after logout
    });

    // The function we return runs when the component disappears:
    // it stops listening, so nothing keeps running for nothing.
    return unsubscribe;
    }, []);
    
    return user;
}