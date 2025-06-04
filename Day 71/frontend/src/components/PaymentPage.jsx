import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const seatIds = location.state?.selectedSeats || [];
  const seatNumbers = location.state?.seatNumbers || [];
  const showId = location.state?.showId;
  const pricePerSeat = location.state?.pricePerSeat || 0;

  const [loading, setLoading] = useState(false);

  console.log("Seat IDs:", seatIds);
  console.log("Seat Numbers:", seatNumbers);


  const handlePaymentSuccess = async () => {
    setLoading(true);
    const paymentDetails = {
      showId,
      seatsBooked: seatIds,
      seatNumbers,
      amount: seatIds.length * pricePerSeat,
      paymentMethod: "dummy-card",
      paymentStatus: "success",
      bookingDate: new Date(),
    };

    try {
      const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentDetails),
      });

      if (!paymentResponse.ok) {
        alert("Failed to save payment info");
        return;
      }

      alert("Payment successful!");

      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      if (!token) {
        alert("User not authenticated. Please login again.");
        navigate("/login");
        setLoading(false);
        return;
      }

      const bookingDetails = {
       showId : showId,
        selectedSeats: seatIds,
        amountPaid: seatIds.length * pricePerSeat,
        paymentMethod: "dummy-card"
      };

const bookingResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, //  This should include your token
        },
        body: JSON.stringify(bookingDetails),
      });

      const data = await bookingResponse.json();

      if (bookingResponse.status === 403) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("user");
        navigate("/login");
        setLoading(false);
        return;
      }

      if (bookingResponse.ok) {
        alert("Booking successful!");
        navigate("/user/bookings");
      } else {
        alert("Booking failed: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl mb-4">Payment Page</h2>
      <p>Seats you are booking: {seatNumbers.join(", ")}</p>
      <p>Total Amount: ₹{seatIds.length * pricePerSeat}</p>

      <button
        onClick={handlePaymentSuccess}
        disabled={loading}
        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Pay Now
      </button>
    </div>
  );
};

export default PaymentPage;
