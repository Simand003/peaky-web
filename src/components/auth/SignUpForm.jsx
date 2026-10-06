// Reusable field, one folder up (components/)
import { useState } from "react";
import FormField from "../FormField";
import PasswordField from "../PasswordField";
import {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
} from "../../utils/validation";
import { registerWithEmail, registerWithGoogle } from "../../services/authService";
import { getAuthErrorMessage } from "../../utils/authErrors";
import GoogleLogo from "../icons/GoogleLogo";
import LinkButton from "../LinkButton";

// First sign-up screen: email and password, or Google.
// onSuccess: called with the new Firebase user once the account is created.
export default function SignUpForm({ onSuccess, onSwitchToLogin }) {
    // One state variable per field: always holds what the user has typed
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState("");

    async function handleSubmit() {
        setFormError("");

        const newErrors = {
            email: validateEmail(email),
            password: validatePassword(password),
            confirmPassword: validateConfirmPassword(password, confirmPassword),
        };
        setErrors(newErrors);

        // The form is valid only if every message is empty
        const isValid = Object.values(newErrors).every((message) => message === "");
        if (!isValid) return;

        // 2) Try to create the account. If the email is taken, Firebase throws an error.
        setIsLoading(true);
        try {
            const user = await registerWithEmail(email.trim(), password);
            onSuccess(user);
        } catch (error) {
            const message = getAuthErrorMessage(error);
            if (error.code === "auth/email-already-in-use" || error.code === "auth/invalid-email") {
                setErrors({ email: message }); // show it under the email field
            } else {
                setFormError(message); // show it above the button
            }
        } finally {
            setIsLoading(false);
        }
    }

    // Runs when "Continue with Google" is pressed
    async function handleGoogle() {
        setFormError("");
        setIsLoading(true);
        try {
            const user = await registerWithGoogle(); // opens the Google window and waits
            onSuccess(user); // go to the second screen
        } catch (error) {
            console.error("Google registration failed:", error.code, error);
            // Closing the Google window on purpose is not an error worth showing
            const closedOnPurpose =
                error.code === "auth/popup-closed-by-user" ||
                error.code === "auth/cancelled-popup-request";
            if (!closedOnPurpose) {
                setFormError(getAuthErrorMessage(error));
            }
        } finally {
            setIsLoading(false); // runs in both cases: re-enable the buttons
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

            {/* Two columns of equal width: password and confirmation side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <PasswordField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    error={errors.password}
                />
                <PasswordField
                    label="Confirm password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    error={errors.confirmPassword}
                />
            </div>

            {formError && (
                <span style={{ color: "var(--md-theme-error)", fontSize: 14 }}>{formError}</span>
            )}

            {/* Main button, same style as the Login button in the top bar */}
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
                {isLoading ? "Creating account..." : "Sign up"}
            </button>

            {/* Divider: line, "or", line. flex: 1 makes both lines share the free space */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <hr style={{ flex: 1, border: 0, borderTop: "1px solid var(--md-theme-outline-variant)" }} />
                <span>or</span>
                <hr style={{ flex: 1, border: 0, borderTop: "1px solid var(--md-theme-outline-variant)" }} />
            </div>

            {/* Google button (the Google logo will come later) */}
            <button
                onClick={handleGoogle}
                disabled={isLoading} // no double clicks while the Google window is open
                style={{
                    display: "flex",
                    justifyContent: "center", // center logo and text horizontally
                    alignItems: "center", // center them vertically
                    gap: 10, // space between the logo and the text
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
                Continue with Google
            </button>

            <span style={{ fontSize: 14, textAlign: "center" }}>
                Already have an account? <LinkButton onClick={onSwitchToLogin}>Log in</LinkButton>
            </span>
        </div>
    );
}