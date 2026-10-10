import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function TripPlanner() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const destinationId = location.state?.destinationId || searchParams.get("destinationId");
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [destinationChoice, setDestinationChoice] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const selectedDestinationId = destinationId || destinationChoice;

    useEffect(() => {
        if (destinationId) return;
        apiRequest("/api/destinations", { auth: false })
            .then(setDestinations)
            .catch((requestError) => setError(requestError.message));
    }, [destinationId]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        if (endDate <= startDate) {
            alert("End date must be after the start date.");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const differenceInTime = end - start;
        const durationDays =
            Math.ceil(differenceInTime / (1000 * 60 * 60 * 24)) + 1;

        if (!selectedDestinationId) {
            setError("Choose a destination before planning your trip.");
            return;
        }

        setError("");
        setSubmitting(true);
        try {
            const data = await apiRequest("/api/trips", {
                method: "POST",
                body: JSON.stringify({
                    destination_id: Number(selectedDestinationId),
                    start_date: startDate,
                    end_date: endDate,
                    duration_days: durationDays
                })
            });

            navigate(`/guides/${selectedDestinationId}?tripId=${data.trip_id}`, {
                state: { destinationId: selectedDestinationId, tripId: data.trip_id }
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h1>Plan Your Trip</h1>
            {error && <p role="alert">{error}</p>}

            <form onSubmit={handleSubmit}>

                {!destinationId && (
                    <div>
                        <label htmlFor="trip-destination">Destination</label>
                        <br />
                        <select
                            id="trip-destination"
                            value={destinationChoice}
                            onChange={(event) => setDestinationChoice(event.target.value)}
                            required
                        >
                            <option value="">Select a destination</option>
                            {destinations.map((destination) => (
                                <option key={destination.destination_id} value={destination.destination_id}>
                                    {destination.city}, {destination.country}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label>Start Date</label>
                    <br />

                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                            setStartDate(event.target.value)
                        }
                    />
                </div>

                <br />

                <div>
                    <label>End Date</label>
                    <br />

                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(event) =>
                            setEndDate(event.target.value)
                        }
                    />
                </div>

                <br />

                {startDate && endDate && endDate > startDate && (
                    <p>
                        Trip Duration:{" "}
                        {Math.ceil(
                            (new Date(endDate) - new Date(startDate)) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}{" "}
                        days
                    </p>
                )}

                <button type="submit" disabled={submitting || !selectedDestinationId}>
                    {submitting ? "Creating trip..." : "Continue to guides"}
                </button>

            </form>
        </div>
    );
}

export default TripPlanner;