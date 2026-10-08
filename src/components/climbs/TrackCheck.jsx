import { Check, TriangleAlert } from "lucide-react";
import { formatTime } from "../../utils/date";
import { PEAK_PASS_TOLERANCE_M } from "../../constants/map";
import "../../styles/trackCheck.css";

// One line per peak of the climb: did the loaded track pass by it?
// entries: the climb's peaks. matches: result of matchPeaksToTrack, or null (no new track).
export default function TrackCheck({ entries, matches }) {
  if (!matches || entries.length === 0) return null;

  const hasMisses = matches.some((m) => !m.matched);

  return (
    <div className="track-check">
      <ul>
        {entries.map((entry, i) => {
          const match = matches[i];
          return (
            <li
              key={`${entry.id}-${i}`}
              className={match.matched ? "track-check__ok" : "track-check__miss"}
            >
              {match.matched ? <Check size={16} /> : <TriangleAlert size={16} />}
              <span>
                {entry.name}
                {match.matched
                  ? ` · ${match.distanceM} m from the summit${
                      match.time ? ` · ${formatTime(match.time)}` : ""
                    }`
                  : ` · the track does not pass within ${PEAK_PASS_TOLERANCE_M} m`}
              </span>
            </li>
          );
        })}
      </ul>

      {hasMisses && (
        <p className="track-check__note">
          Peaks not found on the track are still saved in your diary, but they
          will not count for rankings.
        </p>
      )}
    </div>
  );
}