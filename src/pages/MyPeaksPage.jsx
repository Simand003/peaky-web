import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useUserClimbs from "../hooks/useUserClimbs";
import ClimbCard from "../components/climbs/ClimbCard";
import ClimbFormModal from "../components/climbs/ClimbFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { deleteClimb } from "../services/climbsService";
import { getDiaryStats } from "../utils/climbs";
import usePeaks from "../hooks/usePeaks";
import "../styles/myPeaksPage.css";

// user: the logged-in Firebase user, or null (passed down by App)
export default function MyPeaksPage({ user, authLoading }) {
  const { climbs, loading, error, reload } = useUserClimbs(user?.uid);

  // The climb being edited / waiting for delete confirmation (null = none)
  const [climbToEdit, setClimbToEdit] = useState(null);
  const [climbToDelete, setClimbToDelete] = useState(null);
  const [actionError, setActionError] = useState("");

  // Recompute the stats only when the list of climbs changes
  const stats = useMemo(() => getDiaryStats(climbs), [climbs]);

  const { peaks: allPeaks } = usePeaks();
  const navigate = useNavigate();

  async function handleConfirmDelete() {
    setActionError("");
    try {
      await deleteClimb(climbToDelete);
      reload(); // read the diary again, without the deleted climb
    } catch (e) {
      setActionError(e.message);
    }
    setClimbToDelete(null);
  }

  return (
    <main className="my-peaks">
      <div className="my-peaks__content">
        <Link to="/" className="my-peaks__back">
          <ArrowLeft size={18} />
          Back to map
        </Link>

        <h1>My peaks</h1>

        {!user && !authLoading && (
          <p className="my-peaks__message">Log in to see your diary.</p>
        )}
        {(authLoading || (user && loading)) && (
          <p className="my-peaks__message">Loading...</p>
        )}
        {error && (
          <p className="my-peaks__message my-peaks__message--error">
            Cannot load your diary: {error}
          </p>
        )}
        {actionError && (
          <p className="my-peaks__message my-peaks__message--error">
            Action failed: {actionError}
          </p>
        )}
        {user && !loading && !error && climbs.length === 0 && (
          <p className="my-peaks__message">
            No climbs yet. Open the map, select a peak and press "Add climb".
          </p>
        )}

        {climbs.length > 0 && (
          <>
            <div className="my-peaks__stats">
              <div>
                <strong>{stats.totalClimbs}</strong>
                <span>Climbs</span>
              </div>
              <div>
                <strong>{stats.distinctPeaks}</strong>
                <span>Peaks</span>
              </div>
              <div>
                <strong>{stats.highest} m</strong>
                <span>Highest</span>
              </div>
            </div>

            <ul className="my-peaks__list">
              {climbs.map((climb) => (
                <ClimbCard
                  key={climb.id}
                  climb={climb}
                  // peakIds has no duplicates: one id per different peak
                  onShowOnMap={() => {
                    // peakIds has no duplicates: one id per different peak
                    const params = new URLSearchParams({ peaks: climb.peakIds.join(",") });
                    // Only climbs with a GPX can have a track to draw
                    if (climb.gpx) params.set("track", climb.id);
                    navigate(`/?${params}`);
                  }}
                  onEdit={() => setClimbToEdit(climb)}
                  onDelete={() => setClimbToDelete(climb)}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      {climbToEdit && (
        <ClimbFormModal
          climb={climbToEdit}
          allPeaks={allPeaks}
          onSaved={reload}
          onClose={() => setClimbToEdit(null)}
        />
      )}

      {climbToDelete && (
        <ConfirmDialog
          title="Delete climb"
          message={`Delete your climb of ${climbToDelete.peakName}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setClimbToDelete(null)}
        />
      )}
    </main>
  );
}