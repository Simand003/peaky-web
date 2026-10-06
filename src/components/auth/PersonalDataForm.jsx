import { useState } from "react";
import FormField from "../FormField";
import ChipSelect from "../ChipSelect";
import DateField from "../DateField";
import InfoButton from "../InfoButton";
import { validateRequired, validateBirthDate } from "../../utils/validation";
import { formatDate } from "../../utils/date";
import {
  GENDER_OPTIONS,
  GENDER_INFO_MESSAGE,
  BIRTH_DATE_INFO_MESSAGE,
} from "../../constants/profile";

// Info texts, indexed by the name of the field they belong to
const INFO_MESSAGES = {
  gender: GENDER_INFO_MESSAGE,
  birthDate: BIRTH_DATE_INFO_MESSAGE,
};

// Two columns of equal width, used for the row with name and surname
const rowStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

// Second sign-up screen: personal data.
// onComplete: called with the data when everything is valid.
export default function PersonalDataForm({ onComplete }) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState(undefined); // a Date, or undefined if not chosen
  const [errors, setErrors] = useState({});
  // Which info message is open: null (none), "gender" or "birthDate"
  const [openInfo, setOpenInfo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Open the message of a field, or close it if it is already open
  function toggleInfo(field) {
    setOpenInfo(openInfo === field ? null : field);
  }

  // Runs when "Confirm registration" is pressed
  async function handleSubmit() {
    setSaveError("");
    const newErrors = {
      name: validateRequired(name, "Name"),
      surname: validateRequired(surname, "Surname"),
      gender: validateRequired(gender, "Gender"),
      birthDate: validateBirthDate(birthDate),
    };
    setErrors(newErrors);

    const isValid = Object.values(newErrors).every((message) => message === "");
    if (!isValid) return; // stop here if something is wrong

    setIsSaving(true);
    try {
      // "await" waits for the saving to finish; if it fails, we jump to "catch"
      await onComplete({
        name: name.trim(),
        surname: surname.trim(),
        gender,
        // Saved as "dd/MM/yyyy" text, like the existing Firebase data ("" if not chosen)
        birthDate: birthDate ? formatDate(birthDate) : "",
      });
    } catch (error) {
      console.error("Saving profile failed:", error);
      setSaveError("We could not save your data. Please try again.");
    } finally {
      setIsSaving(false); // runs in both cases: re-enable the button
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Row 1: name and surname (mandatory) */}
      <div style={rowStyle}>
        <FormField
          label="Name *"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <FormField
          label="Surname *"
          value={surname}
          onChange={(event) => setSurname(event.target.value)}
          error={errors.surname}
        />
      </div>

      {/* Gender: one chip can be selected (mandatory) */}
      <ChipSelect
        label="Gender *"
        options={GENDER_OPTIONS}
        value={gender}
        onChange={setGender}
        error={errors.gender}
        endAdornment={
          <InfoButton label="Why we ask for gender" onClick={() => toggleInfo("gender")} />
        }
      />

      {/* Date of birth: opens a calendar (optional) */}
      <DateField
        label="Date of birth"
        value={birthDate}
        onChange={setBirthDate}
        error={errors.birthDate}
        endAdornment={
          <InfoButton
            label="Why we ask for date of birth"
            onClick={() => toggleInfo("birthDate")}
          />
        }
      />

      {/* Info message of the field whose "i" was pressed (nothing if openInfo is null) */}
      {openInfo && (
        <p
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 8,
            fontSize: 14,
            backgroundColor: "var(--md-theme-surface-container-high)",
          }}
        >
          {INFO_MESSAGES[openInfo]}
        </p>
      )}

      <span style={{ color: "var(--md-theme-error)", fontSize: 14 }}>
        Fields marked with * are mandatory
      </span>

      {saveError && (
  <span style={{ color: "var(--md-theme-error)", fontSize: 14 }}>{saveError}</span>
)}

      <button
        onClick={handleSubmit}
        disabled={isSaving}
        style={{
          backgroundColor: "var(--md-theme-primary)",
          color: "var(--md-theme-on-primary)",
          border: "none",
          borderRadius: 8,
          padding: "12px 20px",
          fontSize: 16,
          cursor: "pointer",
          opacity: isSaving ? 0.6 : 1
        }}
      >
        {isSaving ? "Saving..." : "Confirm registration"}
      </button>
    </div>
  );
}