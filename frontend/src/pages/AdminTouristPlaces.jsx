import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function AdminTouristPlaces() {
    const [places, setPlaces] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState({ destination_id: "", place_name: "", description: "", entry_fee: "0" });

    useEffect(() => {
        Promise.all([
            apiRequest("/api/admin/tourist-places"),
            apiRequest("/api/destinations", { auth: false })
        ])
            .then(([placeData, destinationData]) => {
                setPlaces(placeData);
                setDestinations(destinationData);
                if (destinationData.length > 0) {
                    setForm((current) => ({ ...current, destination_id: String(destinationData[0].destination_id) }));
                }
                setLoading(false);
            })
            .catch((requestError) => {
                setError(requestError.message);
                setLoading(false);
            });
    }, []);

    const addPlace = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);
        try {
            const result = await apiRequest("/api/admin/tourist-places", {
                method: "POST",
                body: JSON.stringify({ ...form, destination_id: Number(form.destination_id), entry_fee: Number(form.entry_fee) })
            });
            setMessage(result.message);
            setForm((current) => ({ ...current, place_name: "", description: "", entry_fee: "0" }));
            setPlaces(await apiRequest("/api/admin/tourist-places"));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    const removePlace = async (place) => {
        if (!window.confirm(`Remove ${place.place_name}?`)) return;
        setError("");
        setMessage("");
        setDeletingId(place.place_id);
        try {
            const result = await apiRequest(`/api/admin/tourist-places/${place.place_id}`, { method: "DELETE" });
            setMessage(result.message);
            setPlaces((current) => current.filter((item) => item.place_id !== place.place_id));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <h2>Loading tourist places...</h2>;
    }

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <h1 style={styles.title}>Manage Tourist Places</h1>
                <p style={styles.subtitle}>Add and remove places across TravelMate destinations</p>
            </header>

            <main style={styles.container}>
                {error && <p role="alert" style={styles.error}>{error}</p>}
                {message && <p role="status" style={styles.message}>{message}</p>}

                <form onSubmit={addPlace} style={styles.addForm}>
                    <h2 style={styles.formTitle}>Add Tourist Place</h2>
                    <select aria-label="Destination" value={form.destination_id} onChange={(event) => setForm({ ...form, destination_id: event.target.value })} required>
                        <option value="" disabled>Select destination</option>
                        {destinations.map((destination) => (
                            <option key={destination.destination_id} value={destination.destination_id}>
                                {destination.city}, {destination.country}
                            </option>
                        ))}
                    </select>
                    <input aria-label="Place name" placeholder="Place name" value={form.place_name} onChange={(event) => setForm({ ...form, place_name: event.target.value })} required maxLength={150} />
                    <input aria-label="Description" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                    <input aria-label="Entry fee" type="number" min="0" step="0.01" placeholder="Entry fee" value={form.entry_fee} onChange={(event) => setForm({ ...form, entry_fee: event.target.value })} required />
                    <button type="submit" disabled={saving || destinations.length === 0} style={styles.addButton}>{saving ? "Adding..." : "Add place"}</button>
                </form>

                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Place Name</th>
                                <th style={styles.th}>Description</th>
                                <th style={styles.th}>Entry Fee</th>
                                <th style={styles.th}>City</th>
                                <th style={styles.th}>Country</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {places.map((place) => (
                                <tr key={place.place_id}>
                                    <td style={styles.td}>{place.place_id}</td>
                                    <td style={styles.td}>{place.place_name}</td>
                                    <td style={styles.td}>{place.description}</td>
                                    <td style={styles.td}>₹{place.entry_fee}</td>
                                    <td style={styles.td}>{place.city}</td>
                                    <td style={styles.td}>{place.country}</td>
                                    <td style={styles.td}>
                                        <button type="button" onClick={() => removePlace(place)} disabled={deletingId === place.place_id} style={styles.removeButton}>
                                            {deletingId === place.place_id ? "Removing..." : "Remove"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {places.length === 0 && <p style={styles.empty}>No tourist places found.</p>}
                </div>
            </main>
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", backgroundColor: "#f5f7fb", padding: "40px 20px", fontFamily: "Arial, sans-serif" },
    header: { textAlign: "center", marginBottom: "32px" },
    title: { margin: 0, color: "#1f2937", fontSize: "32px" },
    subtitle: { color: "#6b7280" },
    container: { maxWidth: "1200px", margin: "0 auto" },
    addForm: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px", padding: "20px", backgroundColor: "#ffffff", border: "1px solid #d9e2df" },
    formTitle: { gridColumn: "1 / -1", margin: 0, color: "#1f2937", fontSize: "20px" },
    input: { padding: "10px", border: "1px solid #cbd5e1" },
    addButton: { border: 0, backgroundColor: "#155e54", color: "#ffffff", padding: "10px 16px", fontWeight: 700, cursor: "pointer" },
    removeButton: { border: 0, backgroundColor: "#b42318", color: "#ffffff", padding: "8px 12px", fontWeight: 700, cursor: "pointer" },
    tableCard: { backgroundColor: "#ffffff", padding: "20px", border: "1px solid #d9e2df", overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "12px", backgroundColor: "#f3f4f6", color: "#374151", whiteSpace: "nowrap" },
    td: { padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#111827", verticalAlign: "top" },
    error: { color: "#a12b2b" },
    message: { color: "#166534" },
    empty: { color: "#6b7280", textAlign: "center" }
};

export default AdminTouristPlaces;