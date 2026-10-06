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
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password. If you registered with Google, use the Google button.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "app/email-used-with-other-method":
      return "This email is registered with email and password. Please log in with your password.";
    default:
      return "Something went wrong. Please try again.";
  }
}