import { useState, useMemo } from "react";
import Modal from "../Modal";
import DateField from "../DateField";
import TimeField from "../TimeField";
import FormField from "../FormField";
import PeakPicker from "./PeakPicker";
import { addClimb, updateClimb } from "../../services/climbsService";
import { combineDateAndTime, formatTime } from "../../utils/date";
import { toClimbPeak } from "../../utils/climbs";
import GpxField from "./GpxField";
import TrackCheck from "./TrackCheck";
import { matchPeaksToTrack } from "../../utils/gpx";

// Shared look of the two buttons at the bottom
const buttonStyle = {
  padding: "12px 20px",
  borderRadius: 999,
  fontSize: 15,
  cursor: "pointer",
};

// Add mode: pass `user`, `allPeaks` and optionally `initialPeak`.
// Edit mode: pass the `climb` to change and `allPeaks`.
// onSaved (optional): called after a successful save, e.g. to reload the diary.
export default function ClimbFormModal({
  user,
  climb,
  initialPeak,
  allPeaks,
  onClose,
  onSaved,
}) {
  const isEditing = Boolean(climb);

  // In edit mode the form starts with the saved values
  const savedDate = climb ? climb.climbedAt.toDate() : undefined;

  const [peaks, setPeaks] = useState(
    climb ? climb.peaks : initialPeak ? [toClimbPeak(initialPeak)] : []
  );
  const [date, setDate] = useState(savedDate); // a Date, or undefined
  const [time, setTime] = useState(climb?.hasTime ? formatTime(savedDate) : "");
  const [notes, setNotes] = useState(climb?.notes ?? "");
  const [peaksError, setPeaksError] = useState("");
  const [dateError, setDateError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Summary of the GPX track, or null. In edit mode it starts from the saved one.
  const [gpxStats, setGpxStats] = useState(
    climb?.gpx
      ? { ...climb.gpx, startTime: climb.gpx.startedAt?.toDate() ?? null }
      : null
  );
  // Points of the file chosen in this session (null = no new file: the saved track stays)
  const [trackPoints, setTrackPoints] = useState(null);

  // Check of every peak against the track loaded in this session (null = no new track)
  const matches = useMemo(
    () => (trackPoints ? matchPeaksToTrack(peaks, allPeaks, trackPoints) : null),
    [peaks, allPeaks, trackPoints]
  );

  async function handleSave() {
    setSaveError("");
    let hasErrors = false;

    if (peaks.length === 0) {
      setPeaksError("Add at least one peak");
      hasErrors = true;
    } else {
      setPeaksError("");
    }

    // Merge day + optional time into the values stored in Firestore
    const { climbedAt, hasTime } = date ? combineDateAndTime(date, time) : {};

    if (!date) {
      setDateError("Choose the date of the climb");
      hasErrors = true;
    } else if (climbedAt > new Date()) {
      // Today with a later time of day would still be in the future
      setDateError("The climb cannot be in the future");
      hasErrors = true;
    } else {
      setDateError("");
    }

    if (hasErrors) return;

    let entries = peaks;
    if (matches) {
      // A new track was loaded: write the result of the check on every entry
      entries = peaks.map((entry, i) => ({
        ...toClimbPeak(entry),
        // Client-side check: advisory only, the real verification will be done on a server
        onTrack: matches[i].matched,
        // Time of the pass (null if the file has no timestamps)
        summitAt: matches[i].time,
      }));
    } else if (!gpxStats) {
      // No GPX at all (or removed): entries carry no track data
      entries = peaks.map(toClimbPeak);
    }

    setIsSaving(true);
    try {
      const data = {
        peaks,
        climbedAt,
        hasTime,
        notes: notes.trim(),
        gpx: gpxStats,
        trackPoints,
      };
      if (isEditing) {
        await updateClimb(climb.id, {
          ...data,
          userId: climb.userId,
          hadGpx: Boolean(climb.gpx),
        });
      } else {
        await addClimb({ userId: user.uid, ...data });
      }
      setIsSaved(true);
      // "?.()" calls the function only if the parent passed it
      onSaved?.();
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Called when a GPX is chosen (stats) or removed (null)
  function handleGpxChange(stats, points) {
    setGpxStats(stats);
    setTrackPoints(points);
    // The track is more reliable than what was typed: it overwrites date and time
    if (stats?.startTime) {
      setDate(stats.startTime);
      setTime(formatTime(stats.startTime));
      setDateError("");
    }
  }

  // Confirmation screen shown after a successful save
  if (isSaved) {
    return (
      <Modal title={isEditing ? "Changes saved" : "Climb saved"} onClose={onClose} width={420}>
        <p style={{ marginTop: 0 }}>
          {isEditing
            ? "Your climb has been updated."
            : "Your climb is now in your diary."}
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
    <Modal title={isEditing ? "Edit climb" : "Add climb"} onClose={onClose} width={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PeakPicker
          label="Peaks*"
          allPeaks={allPeaks}
          selected={peaks}
          onChange={setPeaks}
          error={peaksError}
        />

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

        <GpxField label="GPX track (optional)" value={gpxStats} onChange={handleGpxChange} />
        <TrackCheck entries={peaks} matches={matches} />

        <FormField
          as="textarea"
          rows={4}
          label="Notes (optional, private)"
          placeholder="Anything you want to remember about this climb"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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