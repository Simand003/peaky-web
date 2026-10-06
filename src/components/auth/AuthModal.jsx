import { useState } from "react";
import Modal from "../Modal";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import PersonalDataForm from "./PersonalDataForm";
import { cancelRegistration } from "../../services/authService";
import { saveUserProfile } from "../../services/userService";

// Title of the window for each screen
const TITLES = {
  login: "Log in",
  credentials: "Create your account",
  personalData: "Tell us about you",
};

// Manages login and registration inside one modal window.
// initialMode: "login" or "signup", the screen to show first.
// onClose: called when the window closes (finished or cancelled).
export default function AuthModal({ initialMode, onClose }) {
  // Which screen is shown: "login", "credentials" (sign up) or "personalData"
  const [step, setStep] = useState(initialMode === "login" ? "login" : "credentials");
  // The Firebase account whose profile is being completed
  const [newUser, setNewUser] = useState(null);
  // Was that account created just now? (decides what to undo if the user gives up)
  const [isNewAccount, setIsNewAccount] = useState(true);

  // Closing by hand: if the profile screen is open, undo or log out
  async function handleClose() {
    try {
      if (step === "personalData") {
        await cancelRegistration(isNewAccount);
      }
    } catch (error) {
      console.error("Cleanup failed:", error); // only log it, the window must close anyway
    } finally {
      onClose();
    }
  }

  // Called by the profile screen. If saving fails it throws, and that screen shows the error.
  async function handleComplete(data) {
    await saveUserProfile(newUser, data);
    onClose();
  }

  // Moves to the profile screen, remembering the account
  function goToProfile(user, isNew) {
    setNewUser(user);
    setIsNewAccount(isNew);
    setStep("personalData");
  }

  return (
    <Modal
      title={TITLES[step]}
      onClose={handleClose}
      // In the profile screen a stray click outside must not undo anything
      closeOnBackdrop={step !== "personalData"}
    >
      {step === "login" && (
        <LoginForm
          onSuccess={onClose}
          onNeedsProfile={goToProfile}
          onSwitchToSignUp={() => setStep("credentials")}
        />
      )}
      {step === "credentials" && (
        <SignUpForm
          onSuccess={(user) => goToProfile(user, true)}
          onSwitchToLogin={() => setStep("login")}
        />
      )}
      {step === "personalData" && <PersonalDataForm onComplete={handleComplete} />}
    </Modal>
  );
}