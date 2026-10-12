import { useEffect, useState } from "react";
import { subscribeToUserProfile } from "../services/userService";

// Returns the profile saved in Firestore for this uid, or null if there is none yet.
// It updates by itself when the profile changes.
export default function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // subscribeToUserProfile returns the "stop listening" function:
    // React calls it when the uid changes or the component disappears
    return subscribeToUserProfile(uid, setProfile);
  }, [uid]); // start again if the uid changes

  return profile;
}