import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const user = await login(email.trim(), password);
            const destination = {
                customer: "/destinations",
                guide: "/guide-dashboard",
                admin: "/admin-dashboard"
            }[user.role];
            if (!destination) throw new Error("This account role is not supported.");
            navigate(destination, { replace: true });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main style={styles.page}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h1 style={styles.title}>Welcome back</h1>
                <p style={styles.copy}>Sign in to continue with TravelMate.</p>
                {error && <p role="alert" style={styles.error}>{error}</p>}
                <label style={styles.label}>Email<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={styles.input} /></label>
                <label style={styles.label}>Password
                    <span style={styles.passwordField}>
                        <input autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required style={{ ...styles.input, ...styles.passwordInput }} />
                        <button
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                            onClick={() => setShowPassword((visible) => !visible)}
                            style={styles.visibilityButton}
                            title={showPassword ? "Hide password" : "Show password"}
                            type="button"
                        >
                            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                                {showPassword && <path d="m3 3 18 18" />}
                            </svg>
                        </button>
                    </span>
                </label>
                <button disabled={submitting} type="submit" style={styles.submit}>{submitting ? "Signing in..." : "Login"}</button>
                <p style={styles.footer}>New to TravelMate? <Link to="/register">Create a customer account</Link></p>
            </form>
        </main>
    );
}

const styles = {
    page: { display: "grid", placeItems: "center", padding: "42px 20px" },
    form: { width: "min(100%, 440px)", display: "grid", gap: "16px", padding: "28px", textAlign: "left", border: "1px solid #d9e2df", background: "white" },
    title: { margin: 0, color: "#153c38", fontSize: "30px" },
    copy: { margin: 0, color: "#64748b" },
    label: { display: "grid", gap: "6px", color: "#334155", fontSize: "14px" },
    input: { width: "100%", boxSizing: "border-box", padding: "11px", border: "1px solid #cbd5d1", font: "inherit" },
    passwordField: { position: "relative", display: "block" },
    passwordInput: { paddingRight: "44px" },
    visibilityButton: { position: "absolute", top: 0, right: 0, bottom: 0, display: "grid", placeItems: "center", width: "42px", border: 0, background: "transparent", color: "#52635f", cursor: "pointer" },
    submit: { border: 0, background: "#155e54", color: "white", padding: "12px", fontWeight: 700, cursor: "pointer" },
    error: { color: "#a12b2b", margin: 0 },
    footer: { margin: 0, color: "#52635f", fontSize: "14px" }
};

export default Login;