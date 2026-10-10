import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function AdminGuides() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingGuide, setEditingGuide] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editError, setEditError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;
        apiRequest("/api/admin/guides")
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
    }, []);

    const updateGuideStatus = async (guideId, status) => {
        setMessage("");

        try {
            const data = await apiRequest(`/api/admin/guides/${guideId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });

            setMessage(data.message);
            setGuides(await apiRequest("/api/admin/guides"));
        } catch (requestError) {
            setMessage(requestError.message);
        }
    };

    const startEditing = (guide) => {
        setEditingGuide(guide);
        setEditForm({
            name: guide.name || "",
            email: guide.email || "",
            phone: guide.phone || "",
            city: guide.city || "",
            country: guide.country || "",
            languages: guide.languages || "",
            experience_years: guide.experience_years ?? 0,
            status: guide.status || "pending"
        });
        setEditError("");
        setMessage("");
    };

    const saveGuide = async (event) => {
        event.preventDefault();
        setSaving(true);
        setEditError("");

        try {
            const data = await apiRequest(`/api/admin/guides/${editingGuide.guide_id}`, {
                method: "PUT",
                body: JSON.stringify({
                    ...editForm,
                    experience_years: Number(editForm.experience_years)
                })
            });
            setGuides(await apiRequest("/api/admin/guides"));
            setMessage(data.message);
            setEditingGuide(null);
            setEditForm(null);
        } catch (requestError) {
            setEditError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading guides...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.center}>
                <h2>{error}</h2>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>Manage Guides</h1>

                <p style={styles.subtitle}>
                    View and manage registered TravelMate guides
                </p>

                {message && <p style={styles.message}>{message}</p>}
            </div>

            <div style={styles.container}>
                {guides.length === 0 ? (
                    <div style={styles.empty}>
                        <h2>No guides found</h2>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Guide ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>City</th>
                                    <th style={styles.th}>Country</th>
                                    <th style={styles.th}>Languages</th>
                                    <th style={styles.th}>Experience</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {guides.map((guide) => (
                                    <tr key={guide.guide_id}>
                                        <td style={styles.td}>
                                            {guide.guide_id}
                                        </td>

                                        <td style={styles.td}>
                                            {guide.name}
                                        </td>

                                        <td style={styles.td}>
                                            {guide.email}
                                        </td>

                                        <td style={styles.td}>
                                            {guide.phone}
                                        </td>

                                        <td style={styles.td}>
                                            {guide.city}
                                        </td>

                                        <td style={styles.td}>
                                            {guide.country}
                                        </td>

                                        <td style={styles.td}>
                                            {guide.languages}
                                        </td>

                                        <td style={styles.td}>
                                            {guide.experience_years} years
                                        </td>

                                        <td style={styles.td}>
                                            <select
                                                value={guide.status}
                                                onChange={(event) =>
                                                    updateGuideStatus(
                                                        guide.guide_id,
                                                        event.target.value
                                                    )
                                                }
                                                style={styles.statusSelect}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="available">Available</option>
                                                <option value="busy">Busy</option>
                                            </select>
                                        </td>
                                        <td style={styles.td}>
                                            <button type="button" onClick={() => startEditing(guide)}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {editingGuide && editForm && (
                <div style={styles.modalBackdrop} onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !saving) {
                        setEditingGuide(null);
                        setEditForm(null);
                    }
                }}>
                    <form aria-label={`Edit guide ${editingGuide.name}`} onSubmit={saveGuide} style={styles.editForm}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h2 style={styles.modalTitle}>Edit Guide</h2>
                                <p style={styles.modalSubtitle}>Guide ID {editingGuide.guide_id}</p>
                            </div>
                            <button
                                type="button"
                                aria-label="Close edit form"
                                onClick={() => { setEditingGuide(null); setEditForm(null); }}
                                disabled={saving}
                                className="guide-edit-close"
                                style={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>

                        {editError && <p role="alert" style={styles.editError}>{editError}</p>}

                        <div style={styles.editFields}>
                            <label style={styles.field}>
                                Name
                                <input required value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
                            </label>
                            <label style={styles.field}>
                                Email
                                <input required type="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} />
                            </label>
                            <label style={styles.field}>
                                Phone
                                <input required type="tel" value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} />
                            </label>
                            <label style={styles.field}>
                                City
                                <input required value={editForm.city} onChange={(event) => setEditForm({ ...editForm, city: event.target.value })} />
                            </label>
                            <label style={styles.field}>
                                Country
                                <input required value={editForm.country} onChange={(event) => setEditForm({ ...editForm, country: event.target.value })} />
                            </label>
                            <label style={styles.field}>
                                Languages
                                <input required value={editForm.languages} onChange={(event) => setEditForm({ ...editForm, languages: event.target.value })} />
                            </label>
                            <label style={styles.field}>
                                Experience (years)
                                <input required type="number" min="0" step="1" value={editForm.experience_years} onChange={(event) => setEditForm({ ...editForm, experience_years: event.target.value })} />
                            </label>
                            <label style={styles.field}>
                                Status
                                <select value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                </select>
                            </label>
                        </div>

                        <div style={styles.formActions}>
                            <button type="button" onClick={() => { setEditingGuide(null); setEditForm(null); }} disabled={saving} className="guide-edit-cancel" style={styles.cancelButton}>
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif"
    },

    header: {
        textAlign: "center",
        marginBottom: "40px"
    },

    title: {
        margin: 0,
        color: "#1f2937",
        fontSize: "36px"
    },

    subtitle: {
        color: "#6b7280",
        fontSize: "16px"
    },

    message: {
        color: "#166534",
        fontWeight: "bold"
    },

    container: {
        maxWidth: "1200px",
        margin: "0 auto"
    },

    tableCard: {
        backgroundColor: "#ffffff",
        padding: "25px",
        borderRadius: "16px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    },

    th: {
        textAlign: "left",
        padding: "15px",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        whiteSpace: "nowrap"
    },

    td: {
        padding: "15px",
        borderBottom: "1px solid #e5e7eb",
        color: "#111827",
        whiteSpace: "nowrap"
    },

    statusSelect: {
        padding: "8px 10px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        color: "#111827",
        backgroundColor: "#ffffff"
    },

    modalBackdrop: {
        position: "fixed",
        inset: 0,
        zIndex: 10,
        display: "grid",
        placeItems: "center",
        overflowY: "auto",
        padding: "20px",
        background: "rgba(22, 39, 35, 0.48)"
    },

    editForm: {
        display: "grid",
        gap: "20px",
        width: "min(100%, 680px)",
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
        padding: "24px",
        border: "1px solid #d9e2df",
        borderRadius: "10px",
        background: "#ffffff",
        textAlign: "left"
    },

    modalHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px"
    },

    modalTitle: { margin: 0, color: "#203b36", fontSize: "22px" },
    modalSubtitle: { margin: "4px 0 0", color: "#61716e", fontSize: "14px" },
    closeButton: { minWidth: "38px", padding: "4px", fontSize: "22px", lineHeight: 1 },

    editFields: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "16px"
    },

    field: { display: "grid", gap: "6px", color: "#354945", fontSize: "14px" },
    editError: { margin: 0 },
    formActions: { display: "flex", justifyContent: "flex-end", gap: "10px" },
    cancelButton: { borderColor: "#bdcbc7", background: "#ffffff", color: "#354945" },

    empty: {
        backgroundColor: "#ffffff",
        padding: "50px",
        textAlign: "center",
        borderRadius: "16px"
    },

    center: {
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial, sans-serif"
    }
};

export default AdminGuides;