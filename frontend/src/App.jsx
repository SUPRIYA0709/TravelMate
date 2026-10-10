import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Destinations from "./pages/Destinations";
import TripPlanner from "./pages/TripPlanner";
import Hotels from "./pages/Hotels";
import TouristPlaces from "./pages/TouristPlaces";
import Guides from "./pages/Guides";
import CustomerBookings from "./pages/CustomerBookings";
import GuideDashboard from "./pages/GuideDashboard";
import GuideNotifications from "./pages/GuideNotifications";
import GuideRegister from "./pages/GuideRegister";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCustomers from "./pages/AdminCustomers";
import AdminGuides from "./pages/AdminGuides";
import AdminDestinations from "./pages/AdminDestinations";
import AdminHotels from "./pages/AdminHotels";
import AdminTouristPlaces from "./pages/AdminTouristPlaces";
import AdminBookings from "./pages/AdminBookings";
import AdminReviews from "./pages/AdminReviews";
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/trip-planner" element={<ProtectedRoute roles={["customer"]}><TripPlanner /></ProtectedRoute>} />
                <Route path="/hotels/:destinationId?" element={<Hotels />} />
                <Route path="/tourist-places/:destinationId?" element={<TouristPlaces />} />
                <Route path="/guides/:destinationId?" element={<Guides />} />
                <Route path="/my-bookings" element={<ProtectedRoute roles={["customer"]}><CustomerBookings /></ProtectedRoute>} />
                <Route path="/customer-bookings" element={<ProtectedRoute roles={["customer"]}><CustomerBookings /></ProtectedRoute>} />
                <Route path="/guide-dashboard" element={<ProtectedRoute roles={["guide"]}><GuideDashboard /></ProtectedRoute>} />
                <Route path="/guide-notifications" element={<ProtectedRoute roles={["guide"]}><GuideNotifications /></ProtectedRoute>} />
                <Route path="/guide-register" element={<GuideRegister />} />
                <Route path="/admin-dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route
    path="/admin-customers"
    element={<ProtectedRoute roles={["admin"]}><AdminCustomers /></ProtectedRoute>}
/>
<Route path="/admin-guides" element={<ProtectedRoute roles={["admin"]}><AdminGuides /></ProtectedRoute>} />
<Route path="/admin-destinations" element={<ProtectedRoute roles={["admin"]}><AdminDestinations /></ProtectedRoute>} />
<Route path="/admin-hotels" element={<ProtectedRoute roles={["admin"]}><AdminHotels /></ProtectedRoute>} />
<Route
    path="/admin-tourist-places"
    element={<ProtectedRoute roles={["admin"]}><AdminTouristPlaces /></ProtectedRoute>}
/>
<Route
    path="/admin-bookings"
    element={<ProtectedRoute roles={["admin"]}><AdminBookings /></ProtectedRoute>}
/>
<Route
    path="/admin-reviews"
    element={<ProtectedRoute roles={["admin"]}><AdminReviews /></ProtectedRoute>}
/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;