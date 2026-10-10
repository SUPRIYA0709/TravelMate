import { Link } from "react-router-dom";

function Home() {
    return (
        <main style={styles.main}>
            <p style={styles.eyebrow}>TRAVELMATE</p>
            <h1 style={styles.title}>Plan your trip. Find your guide. Explore with confidence.</h1>
            <p style={styles.description}>Discover local places, plan your dates, and connect with an available guide for your destination.</p>
            <div style={styles.actions}>
                <Link to="/destinations" style={styles.primary}>Explore Destinations</Link>
                <Link to="/login" style={styles.secondary}>Login</Link>
                <Link to="/register" style={styles.secondary}>Register</Link>
                <Link to="/guide-register" style={styles.secondary}>Become a Guide</Link>
            </div>
        </main>
    );
}

const styles = {
    main: { minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", maxWidth: "900px", margin: "0 auto", padding: "48px 28px", textAlign: "left" },
    eyebrow: { color: "#147d70", fontWeight: 800, fontSize: "14px", margin: 0 },
    title: { maxWidth: "780px", fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1.08, color: "#153c38", margin: "18px 0" },
    description: { maxWidth: "620px", color: "#52635f", lineHeight: 1.65 },
    actions: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "26px" },
    primary: { background: "#155e54", color: "white", padding: "12px 18px", textDecoration: "none", fontWeight: 700 },
    secondary: { background: "#eef4f1", color: "#155e54", padding: "12px 18px", textDecoration: "none", fontWeight: 700 }
};

export default Home;