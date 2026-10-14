import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/favourites.css"

export default function FavouritesPage({ user }) {
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
            </div>
        </main>
    )
}