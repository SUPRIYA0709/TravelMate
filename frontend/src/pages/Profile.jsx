import { useAuth } from "../context/AuthContext.js";

function Profile() {
    const { user } = useAuth();

    return (
        <main style={styles.page}>
            <h1>Profile</h1>
            <section style={styles.panel}>
                <p><strong>Name</strong><span>{user?.name}</span></p>
                <p><strong>Email</strong><span>{user?.email}</span></p>
                <p><strong>Account type</strong><span>{user?.role}</span></p>
                <p><strong>User ID</strong><span>{user?.user_id}</span></p>
            </section>
        </main>
    );
}

const styles = {
    page: { maxWidth: "720px", margin: "0 auto", padding: "28px", textAlign: "left" },
    panel: { padding: "22px", background: "white", border: "1px solid #d9e2df" },
    p: { display: "flex", justifyContent: "space-between", gap: "16px" }
};

export default Profile;