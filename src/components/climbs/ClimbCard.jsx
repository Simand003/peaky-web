import { useState } from "react";
import { ChevronDown, Mountain, Pencil, Trash2 } from "lucide-react";
import useTrack from "../../hooks/useTrack";
import ClimbMap from "./ClimbMap";
import { formatDate, formatTime } from "../../utils/date";
import { formatDistance, formatDuration } from "../../utils/gpx";
import { formatPeakNames } from "../../utils/climbs";

// One entry of the diary. Closed: the essentials. Open: map, summit times, notes.
// peaksById: Map of all peaks (coordinates for the small map).
export default function ClimbCard({ climb, peaksById, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  // Becomes true at the first opening and stays true: the track is read only once
  const [wasOpened, setWasOpened] = useState(false);

  // The track is read from Firestore only after the card has been opened once
  const { track, loading: trackLoading, error: trackError } = useTrack(
    wasOpened && climb.gpx ? climb.id : null,
    climb.userId
  );

  function toggle() {
    setIsOpen((open) => !open);
    setWasOpened(true);
  }

  // Firestore Timestamp -> JS Date
  const date = climb.climbedAt.toDate();

  // "Grignetta ×2, Resegone": repeated peaks are grouped
  const names = formatPeakNames(climb.peaks);
  // One peak: its elevation. Several peaks: how many.
  const detail =
    climb.peaks.length === 1
      ? `${climb.peaks[0].elevation} m`
      : `${climb.peaks.length} peaks`;

  // Ascents that have the time of their own pass
  const summits = climb.peaks.filter((p) => p.summitAt);

  return (
    <li className="climb-card">
      <div className="climb-card__row">
        {/* Clicking icon and text opens or closes the details */}
        <div className="climb-card__toggle-area" onClick={toggle}>
          <div className="climb-card__icon">
            <Mountain size={20} />
          </div>

          <div className="climb-card__main">
            {/* title shows the full list on hover when the names are cut with "..." */}
            <h2 title={names}>{names}</h2>
            <span className="climb-card__meta">
              {detail} · {formatDate(date)}
              {/* Show the time only if the user entered one */}
              {climb.hasTime && ` · ${formatTime(date)}`}
            </span>
            {climb.gpx && (
              <p className="climb-card__gpx">
                {formatDistance(climb.gpx.distanceM)} · +{climb.gpx.gainM} m
                {climb.gpx.durationSec !== null &&
                  ` · ${formatDuration(climb.gpx.durationSec)}`}
              </p>
            )}
          </div>
        </div>

        <div className="climb-card__actions">
          <button className="climb-card__action" onClick={onEdit} aria-label="Edit climb">
            <Pencil size={18} />
          </button>
          <button className="climb-card__action" onClick={onDelete} aria-label="Delete climb">
            <Trash2 size={18} />
          </button>
          <button
            className={`climb-card__action climb-card__chevron ${isOpen ? "is-open" : ""}`}
            onClick={toggle}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Hide details" : "Show details"}
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="climb-card__details">
          <ClimbMap peaks={climb.peaks} peaksById={peaksById} track={track} />

          {trackLoading && <p className="climb-card__note">Loading track...</p>}
          {trackError && (
            <p className="climb-card__note climb-card__note--error">
              Cannot load the track: {trackError}
            </p>
          )}
          {/* A GPX summary exists but there is no stored track (older climbs) */}
          {climb.gpx && !trackLoading && !trackError && !track && (
            <p className="climb-card__note">
              The track of this climb was not saved. Edit the climb and load the
              GPX file again to see it.
            </p>
          )}

          {summits.length > 0 && (
            <div className="climb-card__summits">
              {summits.map((p, i) => (
                <span key={`${p.id}-${i}`} className="climb-card__summit">
                  {p.name} · {formatTime(p.summitAt.toDate())}
                </span>
              ))}
            </div>
          )}

          {climb.notes && <p className="climb-card__notes">{climb.notes}</p>}
        </div>
      )}
    </li>
  );
}