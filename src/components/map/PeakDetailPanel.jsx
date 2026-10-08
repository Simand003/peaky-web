import { Mountain, X, Plus } from "lucide-react";
import usePeakDetails from "../../hooks/usePeakDetails";
import "../../styles/peakPanel.css";
import { useMemo } from "react";
import MiniBarChart from "./MiniBarChart";
import { formatDate } from "../../utils/date";
import {
  DAYPART_LABELS,
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
  onAddClimb,
  onClose,
}) {

  // Hooks must run before any early return, so this comes first.
  // peak?.id is undefined when nothing is selected.
  const { details, loading, error } = usePeakDetails(peak?.id);

  // Your ascents of this peak, and the numbers for the charts
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
        <section>
          <button
            className="peak-panel__action"
            onClick={onAddClimb}
            // Only logged-in users have a diary
            disabled={!user}
          >
            <Plus size={18} />
            Add climb
          </button>
          {!user && (
            <p className="peak-panel__hint">Log in to save this climb in your diary.</p>
          )}
        </section>
        <section>
          <h3>Info</h3>
          {loading && <p className="peak-panel__empty">Loading...</p>}
          {error && <p className="peak-panel__error">Cannot load details: {error}</p>}
          {details && (
            <>
              <p>
                {details.region}, {details.country}
              </p>
              <div className="peak-panel__stats">
                <div>
                  {/* ?? 0 : counters do not exist until the first climb is logged */}
                  <strong>{details.total_climbs ?? 0}</strong>
                  <span>Climbs</span>
                </div>
                <div>
                  <strong>{details.total_climbers ?? 0}</strong>
                  <span>Climbers</span>
                </div>
              </div>
            </>
          )}
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
                  labels={DAYPART_LABELS}
                  values={stats.byDaypart}
                  note={
                    stats.withoutTime > 0
                      ? `${stats.withoutTime} without a known time, not counted here`
                      : null
                  }
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