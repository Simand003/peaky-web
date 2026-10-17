import { Mountain, X, Plus, Heart } from "lucide-react";
import "../../styles/peakPanel.css";
import { useMemo } from "react";
import MiniBarChart from "./MiniBarChart";
import { formatDate } from "../../utils/date";
import {
  DAYPART_TICKS,
  WEEKDAY_LABELS,
  countByDaypart,
  countByWeekday,
  getPeakAscents,
} from "../../utils/peakStats";

export default function PeakDetailPanel({
  peak,
  user,
  myClimbs,
  myClimbsLoading,
  myClimbsError,
  isFavourite,
  onToggleFavourite,
  onAddClimb,
  onClose,
}) {

  // Your ascents of this peak, and the numbers for the charts
  // (hooks must run before any early return; peak?.id is undefined when nothing is selected)
  const stats = useMemo(() => {
    const ascents = getPeakAscents(myClimbs, peak?.id);
    return {
      ascents,
      byWeekday: countByWeekday(ascents),
      byDaypart: countByDaypart(ascents),
      withoutTime: ascents.filter((a) => !a.hasTime).length,
      // Math.max on dates works: dates become numbers (milliseconds)
      last: ascents.length > 0 ? new Date(Math.max(...ascents.map((a) => a.date))) : null,
    };
  }, [myClimbs, peak?.id]);

  if (!peak) return null;

  // Region and country come with the peak itself (see fetchPeaks).
  // A country without regions (like Slovenia) has the same name in both.
  const place = [peak.region !== peak.country ? peak.region : null, peak.country]
    .filter(Boolean)
    .join(", ");

  return (
    <aside className="peak-panel">
      <header className="peak-panel__header">
        <div className="peak-panel__icon">
          <Mountain size={22} />
        </div>
        <div className="peak-panel__title">
          <h2>{peak.name}</h2>
          <span className="peak-panel__elevation">{peak.elevation} m</span>
        </div>
        <button
          className="peak-panel__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </header>

      <div className="peak-panel__body">
        <section className="peak-panel__button">
          <button
            className={`peak-panel__add-fav ${isFavourite ? "is-active" : ""}`}
            onClick={onToggleFavourite}
            disabled={!user}
            aria-pressed={isFavourite}
          >
            {/* fill="currentColor" paints the heart with the color of the text */}
            <Heart size={18} fill={isFavourite ? "currentColor" : "none"} />
            {isFavourite ? "In favourites" : "Add to favourites"}
          </button>
          <button
            className="peak-panel__add-peak"
            onClick={onAddClimb}
            disabled={!user}
          >
            <Plus size={18} />
            Add peak
          </button>
        </section>
        {!user && (
          <p className="peak-panel__hint">Log in to use Add options.</p>
        )}
        <section>
          <h3>Info</h3>
          {place && <p>{place}</p>}
          <div className="peak-panel__stats">
            <div>
              {/* TODO: the counters will come from the peak statistics, calculated
                  from the climbs. Until then they are always 0. */}
              <strong>{peak.total_climbs ?? 0}</strong>
              <span>Climbs</span>
            </div>
            <div>
              <strong>{peak.total_climbers ?? 0}</strong>
              <span>Climbers</span>
            </div>
          </div>
        </section>

        {user && (
          <section>
            <h3>Your climbs</h3>
            {myClimbsLoading && <p className="peak-panel__empty">Loading...</p>}
            {myClimbsError && (
              <p className="peak-panel__error">Cannot load your climbs: {myClimbsError}</p>
            )}
            {!myClimbsLoading && !myClimbsError && stats.ascents.length === 0 && (
              <p className="peak-panel__empty">You have not climbed this peak yet.</p>
            )}
            {stats.ascents.length > 0 && (
              <>
                <p>
                  {stats.ascents.length} {stats.ascents.length === 1 ? "ascent" : "ascents"}
                  {" · last on "}
                  {formatDate(stats.last)}
                </p>
                <MiniBarChart
                  title="By day of the week"
                  labels={WEEKDAY_LABELS}
                  values={stats.byWeekday}
                />
                <MiniBarChart
                  title="By time of day"
                  ticks={DAYPART_TICKS}
                  values={stats.byDaypart}
                  /*
                  note={
                    stats.withoutTime > 0
                      ? `${stats.withoutTime} without a known time, not counted here`
                      : null
                  } */
                />
              </>
            )}
          </section>
        )}

        <section>
          <h3>Location</h3>
          <p>
            {peak.lat.toFixed(4)}, {peak.lon.toFixed(4)}
          </p>
        </section>

        <section>
          <h3>Reports</h3>
          {/* Placeholder: user reports will be loaded from Firestore later */}
          <p className="peak-panel__empty">No reports yet.</p>
        </section>
      </div>
    </aside>
  );
}