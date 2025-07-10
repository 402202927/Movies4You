<?php
session_start();

// Require login
if (!isset($_SESSION['UserID'])) {
    die("<div style='padding:20px; background:#fff3cd; border:1px solid #ffeeba; max-width:500px; margin:20px auto; font-family:sans-serif;'>Please log in to continue.</div>");
}

$conn = new mysqli("localhost", "root", "", "movies4you");
if ($conn->connect_error) {
    die("Database error: " . $conn->connect_error);
}

$userID = $_SESSION['UserID'];
$movieID = $_POST['movieSelect'];
$cinemaID = $_POST['cinemaSelect'];
$showtime = $_POST['showtime'];
$paymentMethod = $_POST['paymentMethod'] ?? 'PayFast';
$seatsRaw = $_POST['selectedSeats'] ?? '';
$seatsArray = explode(",", $seatsRaw);

if (!$movieID || !$cinemaID || !$showtime || count($seatsArray) === 0) {
    die("<div style='padding:20px; background:#f8d7da; border:1px solid #f5c6cb; max-width:500px; margin:20px auto; font-family:sans-serif;'>Missing booking info. Please fill in all fields and select seats.</div>");
}

// Step 1: Create showtime
$insertShowtime = $conn->prepare("INSERT INTO Showtime (MovieID, TheaterID, DateTime, SeatsAvailable) VALUES (?, ?, ?, ?)");
$seatsAvailable = 100;
$insertShowtime->bind_param("iisi", $movieID, $cinemaID, $showtime, $seatsAvailable);
$insertShowtime->execute();
$showtimeID = $conn->insert_id;

// Step 2: Check for already booked seats
$conflicts = [];
$sql = $conn->prepare("SELECT SeatNumbers FROM Booking WHERE ShowtimeID = ?");
$sql->bind_param("i", $showtimeID);
$sql->execute();
$result = $sql->get_result();
while ($row = $result->fetch_assoc()) {
    $booked = explode(",", $row['SeatNumbers']);
    foreach ($seatsArray as $seat) {
        if (in_array($seat, $booked)) {
            $conflicts[] = $seat;
        }
    }
}

if (count($conflicts) > 0) {
    echo "<div style='padding:20px; background:#f8d7da; border:1px solid #f5c6cb; max-width:500px; margin:20px auto; font-family:sans-serif; text-align:center;'>
            <h3 style='color:#721c24;'>❌ Booking Failed</h3>
            <p>The following seats are already booked:</p>
            <strong>" . implode(", ", $conflicts) . "</strong>
            <p>Please <a href='index.html#book'>go back</a> and choose different seats.</p>
          </div>";
    exit;
}

// Step 3: Insert booking & payment
$seatString = implode(",", $seatsArray);
$totalAmount = count($seatsArray) * 75.00;

$insertBooking = $conn->prepare("INSERT INTO Booking (UserID, ShowtimeID, SeatNumbers, TotalAmount) VALUES (?, ?, ?, ?)");
$insertBooking->bind_param("iisd", $userID, $showtimeID, $seatString, $totalAmount);
$insertBooking->execute();
$bookingID = $conn->insert_id;

$status = "Pending";
$insertPayment = $conn->prepare("INSERT INTO Payment (BookingID, Amount, PaymentMethod, Status) VALUES (?, ?, ?, ?)");
$insertPayment->bind_param("idss", $bookingID, $totalAmount, $paymentMethod, $status);
$insertPayment->execute();

echo "<div style='padding:20px; background:#d4edda; border:1px solid #c3e6cb; max-width:500px; margin:20px auto; font-family:sans-serif; text-align:center;'>
        <h2 style='color:#155724;'>🎉 Booking Successful</h2>
        <p>Booking ID: <strong>$bookingID</strong></p>
        <p>Seats: <strong>$seatString</strong></p>
        <p>Total: <strong>R" . number_format($totalAmount, 2) . "</strong></p>
        <p>Status: <strong>$status</strong></p>
        <a href='index.html#account' class='btn' style='margin-top:15px; display:inline-block;'>Go to My Account</a>
      </div>";

$conn->close();
?>
