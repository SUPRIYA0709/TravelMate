import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setSubmitting(true);
        try {
            await apiRequest("/api/auth/register", {
                method: "POST",
                auth: false,
                body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), phone: form.phone, password: form.password })
            });
            setSuccess("Registration successful! Please login to continue.");
            setForm({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main style={styles.page}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h1 style={styles.title}>Create your account</h1>
                {error && <p role="alert" style={styles.error}>{error}</p>}
                {success && <p role="status" style={styles.success}>{success}</p>}
                {[["name", "Full name", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"], ["password", "Password", "password"], ["confirmPassword", "Confirm password", "password"]].map(([name, label, type]) => (
                    <label key={name} style={styles.label}>{label}<input name={name} type={type} value={form[name]} onChange={update} required style={styles.input} autoComplete={name.includes("Password") || name === "password" ? "new-password" : name} /></label>
                ))}
                <button type="submit" disabled={submitting} style={styles.submit}>{submitting ? "Creating account..." : "Register"}</button>
                <p style={styles.footer}>Already registered? <Link to="/login">Login</Link></p>
            </form>
        </main>
    );
}

const styles = {
    page: { display: "grid", placeItems: "center", padding: "42px 20px" },
    form: { width: "min(100%, 480px)", display: "grid", gap: "14px", padding: "28px", textAlign: "left", border: "1px solid #d9e2df", background: "white" },
    title: { margin: 0, color: "#153c38", fontSize: "30px" },
    label: { display: "grid", gap: "6px", color: "#334155", fontSize: "14px" },
    input: { width: "100%", boxSizing: "border-box", padding: "11px", border: "1px solid #cbd5d1", font: "inherit" },
    submit: { border: 0, background: "#155e54", color: "white", padding: "12px", fontWeight: 700, cursor: "pointer" },
    error: { color: "#a12b2b", margin: 0 },
    success: { color: "#166534", margin: 0, fontWeight: 600 },
    footer: { margin: 0, color: "#52635f", fontSize: "14px" }
};

export default Register;