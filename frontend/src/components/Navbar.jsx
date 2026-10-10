import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const signOut = () => {
        logout();
        navigate("/");
    };

    let links = [];
    if (user?.role === "customer") {
        links = [["Home", "/"], ["Destinations", "/destinations"], ["My Trips", "/customer-bookings"], ["Profile", "/profile"]];
    } else if (user?.role === "guide") {
        links = [["Guide Dashboard", "/guide-dashboard"], ["Notifications", "/guide-notifications"], ["Profile", "/profile"]];
    } else if (user?.role === "admin") {
        links = [
            ["Dashboard", "/admin-dashboard"],
            ["Customers", "/admin-customers"],
            ["Guides", "/admin-guides"],
            ["Destinations", "/admin-destinations"],
            ["Hotels", "/admin-hotels"],
            ["Tourist Places", "/admin-tourist-places"],
            ["Bookings", "/admin-bookings"],
            ["Reviews", "/admin-reviews"],
            ["Profile", "/profile"]
        ];
    }

    return (
        <header style={styles.header}>
            <Link to="/" style={styles.brand}>TravelMate</Link>
            <nav style={styles.nav}>
                {links.map(([label, path]) => (
                    <Link key={path} to={path} style={styles.link}>{label}</Link>
                ))}
                {!user && (
                    <div style={styles.authActions}>
                        <div style={styles.guideActions}>
                            <span style={styles.guideHeading}>FOR GUIDES</span>
                            <Link to="/login" style={styles.guideLoginLink}>Guide Login</Link>
                            <Link to="/guide-register" style={styles.guideLink}>Register as Guide</Link>
                        </div>
                    </div>
                )}
                {user && (
                    <>
                        <span style={styles.identity}>{user.name}</span>
                        <button type="button" onClick={signOut} style={styles.logout}>Logout</button>
                    </>
                )}
            </nav>
        </header>
    );
}

const styles = {
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "14px 24px",
        borderBottom: "1px solid #d9e2df",
        background: "#fff",
        textAlign: "left"
    },
    brand: { color: "#155e54", fontWeight: 800, fontSize: "22px", textDecoration: "none" },
    nav: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "14px", flexWrap: "wrap" },
    link: { color: "#334155", textDecoration: "none", fontSize: "14px" },
    authActions: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
    guideActions: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", paddingLeft: "12px", borderLeft: "1px solid #d9e2df" },
    guideHeading: { color: "#64748b", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em" },
    guideLoginLink: { color: "#155e54", textDecoration: "none", fontSize: "14px", fontWeight: 700, padding: "8px 10px" },
    guideLink: { display: "inline-flex", alignItems: "center", color: "#155e54", textDecoration: "none", fontSize: "14px", fontWeight: 700, padding: "8px 11px", border: "1px solid #8bb8ad", background: "#f0f8f5" },
    identity: { color: "#64748b", fontSize: "14px" },
    logout: { border: 0, background: "#155e54", color: "white", padding: "8px 12px", cursor: "pointer" }
};

export default Navbar;