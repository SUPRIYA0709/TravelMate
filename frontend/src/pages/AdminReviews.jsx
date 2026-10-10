import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest("/api/admin/reviews")
            .then((data) => {
                setReviews(data);
                setLoading(false);
            })
            .catch((requestError) => {
                setError(requestError.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <h2>Loading reviews...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>
            <h1>Admin - Reviews</h1>

            {reviews.length === 0 ? (
                <p>No reviews available.</p>
            ) : (
                <table border="1" cellPadding="10" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Review ID</th>
                            <th>Customer</th>
                            <th>Customer Email</th>
                            <th>Guide</th>
                            <th>Destination</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.review_id}>
                                <td>{review.review_id}</td>
                                <td>{review.customer_name}</td>
                                <td>{review.customer_email}</td>
                                <td>{review.guide_name}</td>
                                <td>
                                    {review.city}, {review.country}
                                </td>
                                <td>{review.rating}/5</td>
                                <td>{review.comment || "No comment"}</td>
                                <td>
                                    {new Date(
                                        review.created_at
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminReviews;