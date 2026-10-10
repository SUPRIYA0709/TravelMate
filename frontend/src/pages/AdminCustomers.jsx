import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest("/api/admin/customers")
            .then((data) => {
                setCustomers(data);
                setLoading(false);
            })
            .catch((requestError) => {
                setError(requestError.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading customers...</h2>
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
                <h1 style={styles.title}>
                    Manage Customers
                </h1>

                <p style={styles.subtitle}>
                    View registered TravelMate customers
                </p>
            </div>

            <div style={styles.container}>

                {customers.length === 0 ? (
                    <div style={styles.empty}>
                        <h2>No customers found</h2>
                    </div>
                ) : (
                    <div style={styles.tableCard}>

                        <table style={styles.table}>

                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>Registered Date</th>
                                </tr>
                            </thead>

                            <tbody>

                                {customers.map((customer) => (

                                    <tr key={customer.user_id}>

                                        <td style={styles.td}>
                                            {customer.user_id}
                                        </td>

                                        <td style={styles.td}>
                                            {customer.name}
                                        </td>

                                        <td style={styles.td}>
                                            {customer.email}
                                        </td>

                                        <td style={styles.td}>
                                            {customer.phone}
                                        </td>

                                        <td style={styles.td}>
                                            {new Date(
                                                customer.created_at
                                            ).toLocaleDateString()}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

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

    container: {
        maxWidth: "1100px",
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
        color: "#374151"
    },

    td: {
        padding: "15px",
        borderBottom: "1px solid #e5e7eb",
        color: "#111827"
    },

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

export default AdminCustomers;