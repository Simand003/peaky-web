// Converts a Firebase Auth error into a message the user can understand.
export function getAuthErrorMessage(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please log in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "app/already-registered":
      return "This Google account is already registered. Please log in instead.";
    case "auth/account-exists-with-different-credential":
      return "This email is already registered with another sign-in method. Please log in instead.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google window. Allow pop-ups for this site and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}