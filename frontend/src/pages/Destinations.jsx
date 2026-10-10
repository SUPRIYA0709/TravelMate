import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
function Destinations() {
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        apiRequest("/api/destinations", { auth: false })
            .then((data) => {
                if (!active) return;
                setDestinations(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                if (!active) return;
                setError(error.message);
                setLoading(false);
            });
        return () => { active = false; };
    }, []);

    if (loading) {
        return <h2>Loading destinations...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>
            <h1>Explore Destinations</h1>

            <div style={styles.grid}>
                {destinations.map((destination) => (
                    <article key={destination.destination_id} style={styles.card}>
                        {destination.image_url && (
                            <img src={destination.image_url} alt={`${destination.city}, ${destination.country}`} style={styles.image} />
                        )}
                        <h2>
                            {destination.city}, {destination.country}
                        </h2>

                        <p>{destination.description}</p>

                       <button
    onClick={() =>
        navigate(`/tourist-places/${destination.destination_id}`)
    }
>
    Explore destination
</button>
                    </article>
                ))}
            </div>
        </div>
    );
}

const styles = {
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "18px", padding: "20px" },
    card: { textAlign: "left", padding: "18px", border: "1px solid #d9e2df", background: "white" },
    image: { width: "100%", aspectRatio: "16 / 9", objectFit: "cover", marginBottom: "12px" }
};

export default Destinations;