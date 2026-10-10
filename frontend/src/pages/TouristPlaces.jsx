import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function TouristPlaces() {
    const location = useLocation();
    const navigate = useNavigate();
    const { destinationId: routeDestinationId } = useParams();
    const destinationId = routeDestinationId || location.state?.destinationId;
    const [places, setPlaces] = useState([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);
    const [loading, setLoading] = useState(Boolean(destinationId));
    const [error, setError] = useState("");

    const selectPlace = (placeId) => {
        setSelectedPlaceId(placeId);
    };

    useEffect(() => {
        if (!destinationId) return;

        let active = true;
        apiRequest(`/api/tourist-places/destination/${destinationId}`, { auth: false })
            .then((data) => {
                if (!active) return;
                setPlaces(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                if (!active) return;
                setError(error.message);
                setLoading(false);
            });
        return () => { active = false; };
    }, [destinationId]);

    if (!destinationId) return <h2>Destination not selected</h2>;

    if (loading) {
        return <h2>Loading tourist places...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>
            <h1>Tourist Places</h1>

            {places.length === 0 ? <p>No tourist places listed for this destination yet.</p> : places.map((place) => (
                <div
                    key={place.place_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectPlace(place.place_id)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            selectPlace(place.place_id);
                        }
                    }}
                    style={{
                        ...styles.card,
                        ...(selectedPlaceId === place.place_id ? styles.selectedCard : {})
                    }}
                >
                    <h2>{place.place_name}</h2>

                    <p>{place.description}</p>

                    <p>
    Entry Fee: ₹{place.entry_fee}
</p>

                    <hr />
                </div>
            ))}
            <button
                type="button"
                disabled={!selectedPlaceId}
                onClick={() => navigate(`/hotels/${destinationId}`, {
                    state: {
                        destinationId,
                        touristPlaceIds: [selectedPlaceId]
                    }
                })}
            >
                View hotels
            </button>
        </div>
    );
}

const styles = {
    card: {
        textAlign: "left",
        maxWidth: "720px",
        margin: "16px auto",
        padding: "18px",
        border: "1px solid #d9e2df",
        background: "white",
        cursor: "pointer"
    },
    selectedCard: {
        border: "2px solid #155e54",
        background: "#eef8f5"
    }
};

export default TouristPlaces;