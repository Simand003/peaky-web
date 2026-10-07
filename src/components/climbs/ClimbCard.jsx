import { Mountain, Pencil, Trash2, MapPin } from "lucide-react";
import { formatPeakNames } from "../../utils/climbs";
import { formatDate, formatTime } from "../../utils/date";

// One entry of the diary: peak, date, optional time and report, plus action buttons
export default function ClimbCard({ climb, onEdit, onDelete, onShowOnMap }) {
  // Firestore Timestamp -> JS Date
  const date = climb.climbedAt.toDate();

  // One peak: its name and elevation. Several peaks: all names and their count.
  const names = formatPeakNames(climb.peaks);
  const detail =
    climb.peaks.length === 1
      ? `${climb.peaks[0].elevation} m`
      : `${climb.peaks.length} peaks`;

  return (
    <li className="climb-card">
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
        {climb.notes && <p className="climb-card__report">{climb.notes}</p>}
      </div>

      <div className="climb-card__actions">
        <button
          className="climb-card__action"
          onClick={onShowOnMap}
          aria-label="Show on map"
        >
          <MapPin size={18} />
        </button>
        <button
          className="climb-card__action"
          onClick={onEdit}
          aria-label="Edit climb"
        >
          <Pencil size={18} />
        </button>
        <button
          className="climb-card__action"
          onClick={onDelete}
          aria-label="Delete climb"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  );
}