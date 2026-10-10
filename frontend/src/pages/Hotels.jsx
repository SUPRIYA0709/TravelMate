import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function Hotels() {
    const location = useLocation();
    const navigate = useNavigate();
    const { destinationId: routeDestinationId } = useParams();
    const destinationId = routeDestinationId || location.state?.destinationId;

    const [hotels, setHotels] = useState([]);
    const [selectedHotelId, setSelectedHotelId] = useState(null);
    const [loading, setLoading] = useState(Boolean(destinationId));
    const [error, setError] = useState("");

    const selectHotel = (hotelId) => {
        setSelectedHotelId(hotelId);
    };

    useEffect(() => {
        if (!destinationId) return;

        let active = true;
        apiRequest(`/api/hotels/destination/${destinationId}`, { auth: false })
            .then((data) => {
                if (!active) return;
                setHotels(data);
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
        return <h2>Loading hotels...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>
            <h1>Select Your Hotel</h1>

            {hotels.length === 0 ? <p>No hotels listed for this destination yet.</p> : hotels.map((hotel) => (
                <div
                    key={hotel.hotel_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectHotel(hotel.hotel_id)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            selectHotel(hotel.hotel_id);
                        }
                    }}
                    style={{
                        ...styles.card,
                        ...(selectedHotelId === hotel.hotel_id ? styles.selectedCard : {})
                    }}
                >
                    <h2>{hotel.hotel_name}</h2>

                    <p>{hotel.address}</p>

                    <p>
                        ₹{hotel.price_per_night} per night
                    </p>

                    <p>
                        Contact: {hotel.contact_number}
                    </p>

                    <hr />
                </div>
            ))}
            <button
                type="button"
                disabled={!selectedHotelId}
                onClick={() => navigate(`/trip-planner?destinationId=${destinationId}`, {
                    state: {
                        ...location.state,
                        destinationId,
                        hotelId: selectedHotelId
                    }
                })}
            >
                Plan this trip
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

export default Hotels;