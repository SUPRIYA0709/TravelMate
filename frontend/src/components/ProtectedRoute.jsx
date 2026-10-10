import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

function ProtectedRoute({ roles, children }) {
    const { session, user } = useAuth();
    const location = useLocation();

    if (!session?.token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(user.role)) {
        const home = {
            customer: "/destinations",
            guide: "/guide-dashboard",
            admin: "/admin-dashboard"
        };
        return <Navigate to={home[user.role] || "/"} replace />;
    }

    return children;
}

export default ProtectedRoute;