import { useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import {
  formatDistance,
  formatDuration,
  parseGpx,
  readFileAsText,
} from "../../utils/gpx";
import { formatDate, formatTime } from "../../utils/date";
import "../../styles/gpxField.css";

// Max file size we accept (a long day of hiking is usually well under 2 MB)
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Controlled field: the parent owns the summary.
// value: { distanceM, gainM, maxEle, durationSec, startTime } or null.
// onChange: called with (summary, points) for a new file, or (null, null) on removal.
export default function GpxField({ label, value, onChange }) {
  const inputRef = useRef(null);
  // Only known right after choosing a file (not when editing a saved climb)
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  // React passes the EVENT here: the chosen file is inside event.target.files
  async function handleFile(event) {
    // Keep a reference: we reset the input only at the end
    const input = event.target;
    const file = input.files[0];
    if (!file) return;

    setError("");

    try {
      if (file.size > MAX_SIZE_BYTES) {
        throw new Error("The file is too big (max 10 MB).");
      }

      const { points, stats } = parseGpx(await readFileAsText(file));
      setFileName(file.name);
      // Two arguments: the summary to show and the points to store
      onChange(stats, points);
    } catch (e) {
      setError(e.message);
    } finally {
      // Now the file has been read: reset the input, so choosing the same file
      // again still triggers onChange
      input.value = "";
    }
  }

  function handleRemove() {
    setFileName("");
    onChange(null, null);
  }

  return (
    <div className="gpx-field">
      <span>{label}</span>

      {/* The real input is hidden: our button opens it */}
      <input
        ref={inputRef}
        type="file"
        accept=".gpx"
        hidden
        onChange={handleFile}
      />

      {!value && (
        <button
          type="button"
          className="gpx-field__button"
          onClick={() => inputRef.current.click()}
        >
          <FileUp size={18} />
          Choose a GPX file
        </button>
      )}

      {value && (
        <>
          <div className="gpx-field__file">
            <span className="gpx-field__name">{fileName || "GPX track"}</span>
            <button
              type="button"
              className="gpx-field__remove"
              onClick={handleRemove}
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>

          <div className="gpx-field__stats">
            <span className="gpx-field__stat">{formatDistance(value.distanceM)}</span>
            <span className="gpx-field__stat">+{Math.round(value.gainM)} m</span>
            {value.maxEle !== null && (
              <span className="gpx-field__stat">max {Math.round(value.maxEle)} m</span>
            )}
            {value.durationSec !== null && (
              <span className="gpx-field__stat">{formatDuration(value.durationSec)}</span>
            )}
            {value.startTime && (
              <span className="gpx-field__stat">
                {formatDate(value.startTime)} {formatTime(value.startTime)}
              </span>
            )}
          </div>

          {!value.startTime && (
            <span className="gpx-field__hint">
              This file has no timestamps, so date and time were not filled.
            </span>
          )}
        </>
      )}

      {error && <span className="gpx-field__error">{error}</span>}
    </div>
  );
}