import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest("/api/admin/bookings")
            .then((data) => {
                setBookings(data);
                setLoading(false);
            })
            .catch((requestError) => {
                setError(requestError.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <h2>Loading bookings...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>
            <h1>Admin - Bookings</h1>

            <table border="1" cellPadding="10" cellSpacing="0">
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Customer Email</th>
                        <th>Guide</th>
                        <th>Guide Email</th>
                        <th>Destination</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Duration</th>
                        <th>Booking Status</th>
                        <th>Trip Status</th>
                    </tr>
                </thead>

                <tbody>
                    {bookings.map((booking) => (
                        <tr key={booking.booking_id}>
                            <td>{booking.booking_id}</td>
                            <td>{booking.customer_name}</td>
                            <td>{booking.customer_email}</td>
                            <td>{booking.guide_name || "Not assigned"}</td>
                            <td>{booking.guide_email || "Not assigned"}</td>
                            <td>
                                {booking.city}, {booking.country}
                            </td>
                            <td>
                                {new Date(booking.start_date).toLocaleDateString()}
                            </td>
                            <td>
                                {new Date(booking.end_date).toLocaleDateString()}
                            </td>
                            <td>{booking.duration_days} days</td>
                            <td>{booking.booking_status}</td>
                            <td>{booking.trip_status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminBookings;