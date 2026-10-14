import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, List, Plus } from "lucide-react";
import useUserClimbs from "../hooks/useUserClimbs";
import usePeaks from "../hooks/usePeaks";
import useFilters from "../hooks/useFilters";
import useSort from "../hooks/useSort";
import ClimbCard from "../components/climbs/ClimbCard";
import ClimbFormModal from "../components/climbs/ClimbFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchField from "../components/SearchField";
import FilterButton from "../components/filters/FilterButton";
import ActiveFilters from "../components/filters/ActiveFilters";
import SortButton from "../components/filters/SortButton";
import { CLIMB_FILTERS } from "../constants/climbFilters";
import { CLIMB_SORTS } from "../constants/climbSorts";
import { deleteClimb } from "../services/climbsService";
import { climbMatchesQuery, formatPeakNames, getDiaryStats } from "../utils/climbs";
import { formatDistance } from "../utils/gpx";
import "../styles/myPeaksPage.css";

// The diary starts with the most recent climbs on top
const INITIAL_SORT = { key: "date", dir: "desc" };

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
  // true while the "Add climb" window is open
  const [isAddingClimb, setIsAddingClimb] = useState(false);

  // The climb being edited / waiting for delete confirmation (null = none)
  const [climbToEdit, setClimbToEdit] = useState(null);
  const [climbToDelete, setClimbToDelete] = useState(null);
  const [actionError, setActionError] = useState("");

  // The list goes through three steps: search, then filters, then sorting
  const searched = useMemo(
    () => climbs.filter((climb) => climbMatchesQuery(climb, query)),
    [climbs, query]
  );
  const filters = useFilters(CLIMB_FILTERS, searched);
  const {
    sort,
    sortedItems: visibleClimbs,
    select: selectSort,
  } = useSort(CLIMB_SORTS, filters.filteredItems, INITIAL_SORT);

  // The numbers follow search and filters (the order does not change them)
  const stats = useMemo(
    () => getDiaryStats(filters.filteredItems),
    [filters.filteredItems]
  );

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
            {/* Search box + filters + sort, on one row */}
            <div className="my-peaks__toolbar">
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Search your climbs by peak name..."
              />
              <FilterButton filters={filters} />
              <SortButton options={CLIMB_SORTS} sort={sort} onSelect={selectSort} />
            </div>

            <ActiveFilters filters={filters} />

            {visibleClimbs.length === 0 ? (
              <p className="my-peaks__message">No climbs match your search or filters.</p>
            ) : (
              <>
                <div className="my-peaks__stats">
                  <div>
                    <strong>{stats.totalClimbs}</strong>
                    <span>Climbs</span>
                  </div>
                  <div>
                    <strong>{stats.totalSummits}</strong>
                    <span>Summits</span>
                  </div>
                  <div>
                    <strong>{stats.distinctPeaks}</strong>
                    <span>Peaks</span>
                  </div>
                  <div>
                    <strong>{stats.highest} m</strong>
                    <span>Highest</span>
                  </div>
                  <div>
                    <strong>{formatDistance(stats.distanceM)}</strong>
                    <span>Distance</span>
                  </div>
                  <div>
                    <strong>{stats.gainM} m</strong>
                    <span>Elevation gain</span>
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

      {isAddingClimb && (
        <ClimbFormModal
          user={user}
          allPeaks={allPeaks}
          // No initialPeak: the peaks list starts empty and you pick them in the form
          onSaved={reload}
          onClose={() => setIsAddingClimb(false)}
        />
      )}

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
    </main>
  );
}