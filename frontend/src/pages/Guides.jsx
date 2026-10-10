import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { apiRequest } from "../services/api";

function Guides() {
    const location = useLocation();
    const navigate = useNavigate();
    const { destinationId: routeDestinationId } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const destinationId = routeDestinationId || location.state?.destinationId;
    const tripId = location.state?.tripId || searchParams.get("tripId");
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [requestingId, setRequestingId] = useState(null);

    useEffect(() => {
        if (!destinationId) return;

        let active = true;
        apiRequest(`/api/guides/destination/${destinationId}`, { auth: false })
            .then((data) => {
                if (!active) return;
                setGuides(data);
                setLoading(false);
            })
            .catch((requestError) => {
                if (!active) return;
                setError(requestError.message);
                setLoading(false);
            });
        return () => { active = false; };
    }, [destinationId]);

    const requestGuide = async (guideId) => {
        if (user?.role !== "customer") {
            navigate("/login");
            return;
        }
        if (!tripId) {
            setError("Plan your trip before requesting a guide.");
            return;
        }

        setRequestingId(guideId);
        setError("");
        try {
            await apiRequest("/api/bookings", {
                method: "POST",
                body: JSON.stringify({ trip_id: Number(tripId), guide_id: guideId })
            });
            navigate("/customer-bookings", {
                state: { successMessage: "Guide request sent successfully." }
            });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setRequestingId(null);
        }
    };

    if (!destinationId) return <h2>Choose a destination to view guides.</h2>;
    if (loading) return <h2>Loading guides...</h2>;

    return (
        <div>
            <h1>Available Guides</h1>
            {error && <p role="alert">{error}</p>}
            {!tripId && destinationId && (
                <p>
                    Plan dates before requesting a guide.{" "}
                    <Link to={`/trip-planner?destinationId=${destinationId}`} state={{ destinationId }}>
                        Plan your trip
                    </Link>
                </p>
            )}

            {guides.length === 0 ? (
                <p>No available guides for this destination.</p>
            ) : (
                guides.map((guide) => (
                    <div key={guide.guide_id}>
                        <h2>{guide.name}</h2>

                        <p>
                            <strong>Location:</strong>{" "}
                            {guide.city}, {guide.country}
                        </p>

                        <p>
                            <strong>Languages:</strong>{" "}
                            {guide.languages}
                        </p>

                        <p>
                            <strong>Experience:</strong>{" "}
                            {guide.experience_years} years
                        </p>

                        <p>
                            <strong>Phone:</strong>{" "}
                            {guide.phone}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {guide.status}
                        </p>

                        <button
                            disabled={requestingId === guide.guide_id || !tripId}
                            onClick={() => requestGuide(guide.guide_id)}
                        >
                            {requestingId === guide.guide_id ? "Sending..." : "Request Guide"}
                        </button>

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
}

export default Guides;