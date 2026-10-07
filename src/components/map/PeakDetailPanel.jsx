import { Mountain, X, Plus } from "lucide-react";
import usePeakDetails from "../../hooks/usePeakDetails";
import "../../styles/peakPanel.css";

export default function PeakDetailPanel({ peak, user, onAddClimb, onClose }) {
  // Hooks must run before any early return, so this comes first.
  // peak?.id is undefined when nothing is selected.
  const { details, loading, error } = usePeakDetails(peak?.id);

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