import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, List } from "lucide-react";
import useUserClimbs from "../hooks/useUserClimbs";
import usePeaks from "../hooks/usePeaks";
import ClimbCard from "../components/climbs/ClimbCard";
import ClimbFormModal from "../components/climbs/ClimbFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchField from "../components/SearchField";
import { deleteClimb } from "../services/climbsService";
import { climbMatchesQuery, formatPeakNames, getDiaryStats } from "../utils/climbs";
import { formatDistance } from "../utils/gpx";
import "../styles/myPeaksPage.css";

// user: the logged-in Firebase user, or null (passed down by App)
export default function MyPeaksPage({ user, authLoading }) {
  const { climbs, loading, error, reload } = useUserClimbs(user?.uid);
  const { peaks: allPeaks } = usePeaks();

  // id -> peak (with coordinates), to place the peaks of a climb on its small map
  const peaksById = useMemo(
    () => new Map(allPeaks.map((p) => [p.id, p])),
    [allPeaks]
  );

  // Changing this number gives every card a new key: all cards start closed again
  const [listVersion, setListVersion] = useState(0);
  // Text typed in the search box
  const [query, setQuery] = useState("");

  // The climb being edited / waiting for delete confirmation (null = none)
  const [climbToEdit, setClimbToEdit] = useState(null);
  const [climbToDelete, setClimbToDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  // true while the "Add climb" window is open
  const [isAddingClimb, setIsAddingClimb] = useState(false);

  // Only the climbs that match the search
  const visibleClimbs = useMemo(
    () => climbs.filter((climb) => climbMatchesQuery(climb, query)),
    [climbs, query]
  );

  // The numbers follow the search. To always show the whole diary instead,
  // use `climbs` here in place of `visibleClimbs`.
  const stats = useMemo(() => getDiaryStats(visibleClimbs), [visibleClimbs]);

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

        <div className="my-peaks__header">
          <h1>My peaks</h1>
          {/* Only logged-in users have a diary */}
          {user && (
            <div className="my-peaks__actions">
              <Link to="/my-peaks/list" className="my-peaks__list-link">
                <List size={18} />
                Peaks list
              </Link>
              <button className="my-peaks__add" onClick={() => setIsAddingClimb(true)}>
                <Plus size={18} />
                Add peak
              </button>
            </div>
          )}
        </div>

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
            No climbs yet. Press "Add peak" to save your first one.
          </p>
        )}

        {climbs.length > 0 && (
          <>
            <div className="my-peaks__search">
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Search your climbs by peak name..."
              />
            </div>

            {visibleClimbs.length === 0 ? (
              <p className="my-peaks__message">No climbs match "{query.trim()}".</p>
            ) : (
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
                    <strong>{stats.totalSummits}</strong>
                    <span>Total summits</span>
                  </div>
                  <div>
                    <strong>{formatDistance(stats.distanceM)}</strong>
                    <span>Distance</span>
                  </div>
                  <div>
                    <strong>{stats.gainM} m</strong>
                    <span>Elevation gain</span>
                  </div>
                  <div>
                    <strong>{stats.highest} m</strong>
                    <span>Highest peak</span>
                  </div>
                </div>

                <ul className="my-peaks__list">
                  {visibleClimbs.map((climb) => (
                    <ClimbCard
                      key={`${listVersion}-${climb.id}`}
                      climb={climb}
                      peaksById={peaksById}
                      onEdit={() => setClimbToEdit(climb)}
                      onDelete={() => setClimbToDelete(climb)}
                    />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      {climbToEdit && (
        <ClimbFormModal
          climb={climbToEdit}
          allPeaks={allPeaks}
          onSaved={() => {
            reload();
            // New keys: every card starts closed, so none keeps an outdated track
            setListVersion((v) => v + 1);
          }}
          onClose={() => setClimbToEdit(null)}
        />
      )}

      {climbToDelete && (
        <ConfirmDialog
          title="Delete climb"
          message={`Delete your climb of ${formatPeakNames(climbToDelete.peaks)}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setClimbToDelete(null)}
        />
      )}

      {isAddingClimb && (
        <ClimbFormModal
          user={user}
          allPeaks={allPeaks}
          // No initialPeak: the peaks list starts empty and you pick them in the form
          onSaved={reload}
          onClose={() => setIsAddingClimb(false)}
        />
      )}
    </main>
  );
}