import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Mountain } from "lucide-react";
import CategoryTabs from "../components/CategoryTabs";
import useFavourites from "../hooks/useFavourites";
import usePeaks from "../hooks/usePeaks";
import { PLACE_CATEGORIES } from "../constants/categories";
import "../styles/favourites.css";

// user: the logged-in Firebase user, or null. authLoading: Firebase is still restoring the session.
export default function FavouritesPage({ user, authLoading }) {
  const navigate = useNavigate();
  const { favourites, loading, error, toggle } = useFavourites(user?.uid);
  const { peaks } = usePeaks();
  const [categoryKey, setCategoryKey] = useState("peak");

  const category = PLACE_CATEGORIES.find((c) => c.key === categoryKey);

  // id -> peak, to show region and country (they are not stored in the favourite)
  const peaksById = useMemo(
    () => new Map(peaks.map((p) => [p.id, p])),
    [peaks]
  );

  // The favourites of each category, in alphabetical order
  const byCategory = useMemo(() => {
    const groups = {};
    for (const f of favourites) {
      // ??= creates the list the first time we see that type
      (groups[f.type] ??= []).push(f);
    }
    for (const list of Object.values(groups)) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return groups;
  }, [favourites]);

  const peakFavourites = byCategory.peak ?? [];
  // Only categories with content have a number (refuges are "coming soon")
  const counts = { peak: peakFavourites.length };

  return (
    <main className="favourites">
      <div className="favourites__content">
        <Link to="/" className="favourites__back">
          <ArrowLeft size={18} />
          Back to map
        </Link>

        <div className="favourites__header">
          <h1>Favourites</h1>
        </div>

        {!user && !authLoading && (
          <p className="favourites__message">Log in to see your favourites.</p>
        )}
        {authLoading && <p className="favourites__message">Loading...</p>}

        {user && (
          <div className="favourites__box">
            <CategoryTabs
              categories={PLACE_CATEGORIES}
              value={categoryKey}
              onChange={setCategoryKey}
              counts={counts}
            />

            <div className="favourites__body">
              {!category.available ? (
                <p className="favourites__coming-soon">Coming soon...</p>
              ) : (
                <>
                  {loading && <p className="favourites__message">Loading...</p>}
                  {error && (
                    <p className="favourites__message favourites__message--error">
                      {error}
                    </p>
                  )}
                  {!loading && !error && peakFavourites.length === 0 && (
                    <p className="favourites__message">
                      No favourite peaks yet. Open a peak on the map and press
                      "Add to favourites".
                    </p>
                  )}

                  <ul className="favourites__list">
                    {peakFavourites.map((fav) => {
                      const peak = peaksById.get(fav.itemId);
                      const place = [peak?.region, peak?.country]
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <li key={fav.id} className="favourite-row">
                          {/* Opens the map on this peak */}
                          <button
                            type="button"
                            className="favourite-row__main"
                            onClick={() => navigate(`/?peaks=${fav.itemId}`)}
                          >
                            <span className="favourite-row__icon">
                              <Mountain size={20} />
                            </span>
                            <span className="favourite-row__text">
                              <strong>{fav.name}</strong>
                              <span>
                                {fav.elevation} m{place && ` · ${place}`}
                              </span>
                            </span>
                          </button>

                          {/* Filled heart: pressing it removes the peak from the favourites */}
                          <button
                            type="button"
                            className="favourite-row__remove"
                            onClick={() =>
                              toggle("peak", {
                                id: fav.itemId,
                                name: fav.name,
                                elevation: fav.elevation,
                              })
                            }
                            aria-label={`Remove ${fav.name} from favourites`}
                          >
                            <Heart size={18} fill="currentColor" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}