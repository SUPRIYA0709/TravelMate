import React, { useState } from "react";
import { useEffect } from "react";
import { apiRequest } from "../services/api";

function GuideRegister() {
    const [destinations, setDestinations] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        city: "",
        country: "",
        languages: "",
        experience_years: "",
        destination_id: ""
    });

    useEffect(() => {
        apiRequest("/api/destinations", { auth: false })
            .then(setDestinations)
            .catch((requestError) => setError(requestError.message));
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    const experience = Number(formData.experience_years);
    if (!Number.isFinite(experience) || experience < 0) {
        setError("Experience must be a valid non-negative number.");
        return;
    }

    setSubmitting(true);
    try {
        const data = await apiRequest("/api/auth/register-guide", {
            method: "POST",
            auth: false,
            body: JSON.stringify({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone,
                city: formData.city.trim(),
                country: formData.country.trim(),
                languages: formData.languages.trim(),
                experience_years: experience,
                destination_id: Number(formData.destination_id)
            })
        });

        setSuccess(data.message || "Guide registration successful. Waiting for admin approval.");

        setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            city: "",
            country: "",
            languages: "",
            experience_years: "",
            destination_id: ""
        });

    } catch (requestError) {
        setError(requestError.message);
    } finally {
        setSubmitting(false);
    }
};

    return (
        <div style={styles.container}>
            <div style={styles.formBox}>
                <h1>Guide Registration</h1>
                <p style={styles.subtitle}>
                    Register as a TravelMate guide
                </p>
                {error && <p role="alert" style={styles.error}>{error}</p>}
                {success && <p role="status" style={styles.success}>{success}</p>}

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="languages"
                        placeholder="Languages (Example: English,Tamil,Hindi)"
                        value={formData.languages}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="experience_years"
                        placeholder="Experience in Years"
                        min="0"
                        value={formData.experience_years}
                        onChange={handleChange}
                        required
                    />

                    <select name="destination_id" value={formData.destination_id} onChange={handleChange} required>
                        <option value="">Preferred Destination</option>
                        {destinations.map((destination) => (
                            <option key={destination.destination_id} value={destination.destination_id}>
                                {destination.city}, {destination.country}
                            </option>
                        ))}
                    </select>

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Register as Guide"}
                    </button>

                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fb",
        padding: "30px"
    },

    formBox: {
        width: "100%",
        maxWidth: "500px",
        background: "#ffffff",
        padding: "35px",
        borderRadius: "15px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
    },

    subtitle: {
        color: "#666",
        marginBottom: "25px"
    },

    error: {
        color: "#a12b2b"
    },

    success: {
        color: "#166534"
    }
};

export default GuideRegister;