import { useState } from "react";
import FormField from "../FormField";
import PasswordField from "../PasswordField";
import LinkButton from "../LinkButton";
import GoogleLogo from "../icons/GoogleLogo";
import { validateEmail, validateRequired } from "../../utils/validation";
import { loginWithEmail, loginWithGoogle } from "../../services/authService";
import { getAuthErrorMessage } from "../../utils/authErrors";

// Login screen: email and password, or Google.
// onSuccess: called when the user is logged in and already has a profile.
// onNeedsProfile: called with (user, isNewAccount) when the account has no profile yet.
// onSwitchToSignUp: called when the user clicks the "Sign up" link.
export default function LoginForm({ onSuccess, onNeedsProfile, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Decides what to do once Firebase has logged the user in
  function handleLoggedIn({ user, isNewAccount, hasProfile }) {
    if (hasProfile) {
      onSuccess(); // fully registered: close the window
    } else {
      onNeedsProfile(user, isNewAccount); // registration never completed: finish it now
    }
  }

  // Runs when the Login button is pressed
  async function handleSubmit() {
    setFormError("");
    const newErrors = {
      email: validateEmail(email),
      password: validateRequired(password, "Password"),
    };
    setErrors(newErrors);

    const isValid = Object.values(newErrors).every((message) => message === "");
    if (!isValid) return; // stop here if something is wrong

    setIsLoading(true);
    try {
      handleLoggedIn(await loginWithEmail(email.trim(), password));
    } catch (error) {
      console.error("Login failed:", error.code, error);
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  // Runs when "Login with Google" is pressed
  async function handleGoogle() {
    setFormError("");
    setIsLoading(true);
    try {
      handleLoggedIn(await loginWithGoogle());
    } catch (error) {
      console.error("Google login failed:", error.code, error);
      // Closing the Google window on purpose is not an error worth showing
      const closedOnPurpose =
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request";
      if (!closedOnPurpose) {
        setFormError(getAuthErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <FormField
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <PasswordField
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />

      {formError && (
        <span style={{ color: "var(--md-theme-error)", fontSize: 14 }}>{formError}</span>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        style={{
          backgroundColor: "var(--md-theme-primary)",
          color: "var(--md-theme-on-primary)",
          border: "none",
          borderRadius: 8,
          padding: "12px 20px",
          fontSize: 16,
          cursor: isLoading ? "default" : "pointer",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <hr style={{ flex: 1, border: 0, borderTop: "1px solid var(--md-theme-outline-variant)" }} />
        <span>or</span>
        <hr style={{ flex: 1, border: 0, borderTop: "1px solid var(--md-theme-outline-variant)" }} />
      </div>

      <button
        onClick={handleGoogle}
        disabled={isLoading}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          backgroundColor: "white",
          color: "var(--md-theme-on-background)",
          border: "1px solid var(--md-theme-outline)",
          borderRadius: 8,
          padding: "12px 20px",
          fontSize: 16,
          cursor: isLoading ? "default" : "pointer",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        <GoogleLogo />
        Login with Google
      </button>

      {/* Link to the other screen */}
      <span style={{ fontSize: 14, textAlign: "center" }}>
        Don't have an account? <LinkButton onClick={onSwitchToSignUp}>Sign up</LinkButton>
      </span>
    </div>
  );
}