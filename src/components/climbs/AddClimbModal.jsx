import { useState } from "react";
import Modal from "../Modal";
import DateField from "../DateField";
import TimeField from "../TimeField";
import FormField from "../FormField";
import { addClimb } from "../../services/climbsService";
import { combineDateAndTime } from "../../utils/date";

// Shared look of the two buttons at the bottom
const buttonStyle = {
  padding: "12px 20px",
  borderRadius: 999,
  fontSize: 15,
  cursor: "pointer",
};

export default function AddClimbModal({ peak, user, onClose }) {
  const [date, setDate] = useState(undefined); // a Date, or undefined
  const [time, setTime] = useState(""); // "HH:mm" or "" (optional)
  const [report, setReport] = useState("");
  const [dateError, setDateError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  async function handleSave() {
    setSaveError("");

    if (!date) {
      setDateError("Choose the date of the climb");
      return;
    }

    // Merge day + optional time into the values stored in Firestore
    const { climbedAt, hasTime } = combineDateAndTime(date, time);

    // Today with a later time of day would still be in the future
    if (climbedAt > new Date()) {
      setDateError("The climb cannot be in the future");
      return;
    }
    setDateError("");

    setIsSaving(true);
    try {
      await addClimb({
        userId: user.uid,
        peak,
        climbedAt,
        hasTime,
        report: report.trim(),
      });
      setIsSaved(true);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      // Runs both after success and after an error
      setIsSaving(false);
    }
  }

  // Confirmation screen shown after a successful save
  if (isSaved) {
    return (
      <Modal title="Climb saved" onClose={onClose} width={420}>
        <p style={{ marginTop: 0 }}>
          Your climb of <strong>{peak.name}</strong> is now in your diary.
        </p>
        <button
          onClick={onClose}
          style={{
            ...buttonStyle,
            border: "none",
            backgroundColor: "var(--md-theme-primary)",
            color: "var(--md-theme-on-primary, #ffffff)",
          }}
        >
          Close
        </button>
      </Modal>
    );
  }

  return (
    <Modal title="Add climb" onClose={onClose} width={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ margin: 0, color: "var(--md-theme-on-surface-variant)" }}>
          {peak.name} · {peak.elevation} m
        </p>

        <DateField
          label="Date of the climb*"
          value={date}
          onChange={setDate}
          error={dateError}
          // Recent dates: open on the current month, navigate with arrows
          startMonth={new Date(2000, 0)}
          defaultMonth={new Date()}
          captionLayout="label"
        />

        <TimeField label="Time (optional)" value={time} onChange={setTime} />

        <FormField
          as="textarea"
          rows={4}
          label="Report (optional, private)"
          placeholder="How did it go?"
          value={report}
          onChange={(e) => setReport(e.target.value)}
        />

        {saveError && (
          <span style={{ color: "var(--md-theme-error)", fontSize: 14 }}>
            Could not save: {saveError}
          </span>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              ...buttonStyle,
              border: "1px solid var(--md-theme-outline)",
              backgroundColor: "transparent",
              color: "var(--md-theme-primary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            // Prevents double saves while the request is running
            disabled={isSaving}
            style={{
              ...buttonStyle,
              border: "none",
              backgroundColor: "var(--md-theme-primary)",
              color: "var(--md-theme-on-primary, #ffffff)",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}