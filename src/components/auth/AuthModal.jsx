import { useState } from "react";
import Modal from "../Modal";
import SignUpForm from "./SignUpForm";
import PersonalDataForm from "./PersonalDataForm";
import { cancelRegistration } from "../../services/authService";
import { saveUserProfile } from "../../services/userService";
import { User } from "lucide-react";

// Manages the whole registration flow inside one modal window.
// onClose: called when the user closes the window or finishes the registration.
export default function AuthModal({ onClose }) {
  // Which screen is shown: "credentials" (first) or "personalData" (second)
  const [step, setStep] = useState("credentials");
  // The Firebase account created by the first screen, needed to save the profile
  const [newUser, setNewUser] = useState(null);

  // Closing by hand: if the account exists but the profile was not saved, undo it
  async function handleClose() {
    try {
      if (step === "personalData") {
        await cancelRegistration();
      }
    } catch (error) {
    } finally {
      onClose(); // "finally" always runs, even if the cleanup above failed
    }
  }

  // Called by the second screen when the data is valid
  async function handleComplete(data) {
    await saveUserProfile(newUser, data);
    onClose();
  }

  return (
    <Modal
      title={step === "credentials" ? "Create your account" : "Tell us about you"}
      onClose={handleClose}
      closeOnBackDrop={step === "credentials"}
    >
      {step === "credentials" ? (
        // When the first screen succeeds, move to the second
        <SignUpForm
          onSuccess={(user) => {
            setNewUser(user);
            setStep("personalData");
          }}
        />
      ) : (
        <PersonalDataForm onComplete={handleComplete} />
      )}
    </Modal>
  );
}