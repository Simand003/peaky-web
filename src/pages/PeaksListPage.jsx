import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp } from "lucide-react";
import useUserClimbs from "../hooks/useUserClimbs";
import { getPeakSummaries } from "../utils/climbs";
import { formatDistance } from "../utils/gpx";
import "../styles/myPeaksPage.css";
import "../styles/peaksListPage.css";

// key: field of the row used to sort. The labels are what the user sees.
const COLUMNS = [
    { key: "name", label: "Peak" },
    { key: "elevation", label: "Elevation" },
    { key: "times", label: "Times reached" },
    { key: "distanceM", label: "Distance" },
    { key: "gainM", label: "Elevation gain" },
];

// user: the logged-in Firebase user, or null (passed down by App)
export default function PeaksListPage({ user, authLoading }) {
    const { climbs, loading, error } = useUserClimbs(user?.uid);
    // Starts with the most climbed peaks on top
    const [sort, setSort] = useState({ key: "times", dir: "desc" });

    const rows = useMemo(() => {
        const factor = sort.dir === "asc" ? 1 : -1;
        // getPeakSummaries returns a fresh array, so sorting it is safe
        return getPeakSummaries(climbs).sort((a, b) => {
            const diff =
                sort.key === "name"
                    ? a.name.localeCompare(b.name)
                    : a[sort.key] - b[sort.key];
            // Same value: alphabetical order keeps the list stable
            return diff * factor || a.name.localeCompare(b.name);
        });
    }, [climbs, sort]);

    function handleSort(key) {
        setSort((current) =>
            current.key === key
                ? // Same column again: flip the direction
                { key, dir: current.dir === "asc" ? "desc" : "asc" }
                : // New column: names start from A, numbers start from the biggest
                { key, dir: key === "name" ? "asc" : "desc" }
        );
    }

    return (
        <main className="my-peaks">
            <div className="my-peaks__content">
                <Link to="/my-peaks" className="my-peaks__back">
                    <ArrowLeft size={18} />
                    Back to My peaks
                </Link>

                <div className="my-peaks__header">
                    <h1>Peaks list</h1>
                </div>

                {!user && !authLoading && (
                    <p className="my-peaks__message">Log in to see your peaks.</p>
                )}
                {(authLoading || (user && loading)) && (
                    <p className="my-peaks__message">Loading...</p>
                )}
                {error && (
                    <p className="my-peaks__message my-peaks__message--error">
                        Cannot load your peaks: {error}
                    </p>
                )}
                {user && !loading && !error && rows.length === 0 && (
                    <p className="my-peaks__message">
                        No peaks yet. Add a climb in My peaks and it will appear here.
                    </p>
                )}

                {rows.length > 0 && (
                    <>
                        <div className="peaks-table-wrap">
                            <table className="peaks-table">
                                <thead>
                                    <tr>
                                        {COLUMNS.map((col) => (
                                            <th
                                                key={col.key}
                                                aria-sort={
                                                    sort.key === col.key
                                                        ? sort.dir === "asc"
                                                            ? "ascending"
                                                            : "descending"
                                                        : "none"
                                                }
                                            >
                                                <button
                                                    className="peaks-table__sort"
                                                    onClick={() => handleSort(col.key)}
                                                >
                                                    {/* Only the name column shows the total number of peaks next to its label */}
                                                    {col.key === "name" ? `${col.label} (${rows.length})` : col.label}
                                                    {/* The arrow shows only on the column used for sorting */}
                                                    {sort.key === col.key &&
                                                        (sort.dir === "asc" ? (
                                                            <ArrowUp size={14} />
                                                        ) : (
                                                            <ArrowDown size={14} />
                                                        ))}
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.name}</td>
                                            <td>{row.elevation} m</td>
                                            <td>{row.times}</td>
                                            {/* A dash when no climb of this peak has a GPX */}
                                            <td>{row.withGpx ? formatDistance(row.distanceM) : "–"}</td>
                                            <td>{row.withGpx ? `${Math.round(row.gainM)} m` : "–"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="peaks-list__note">
                            Distance and elevation gain are those of the whole climb: a peak takes all of
                            it for every climb it appears in (once per climb, even if reached several
                            times). Climbs without a GPX have none.
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}