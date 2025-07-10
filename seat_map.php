<?php
session_start();
$conn = new mysqli("localhost", "root", "", "movies4you");

// Assume you get these from your form (e.g. via POST or GET)
$showtimeID = $_GET['showtimeID'] ?? 1; // Example default showtime ID

// Get already booked seats for this showtime
$bookedSeats = [];
$sql = $conn->prepare("SELECT SeatNumbers FROM Booking WHERE ShowtimeID = ?");
$sql->bind_param("i", $showtimeID);
$sql->execute();
$result = $sql->get_result();
while ($row = $result->fetch_assoc()) {
    $booked = explode(",", $row['SeatNumbers']);
    $bookedSeats = array_merge($bookedSeats, $booked);
}

// Generate seat map
for ($row = 1; $row <= 5; $row++) {
    for ($seat = 1; $seat <= 10; $seat++) {
        $seatID = "R{$row}S{$seat}";
        $isBooked = in_array($seatID, $bookedSeats);
        $disabled = $isBooked ? "disabled" : "";
        $style = $isBooked ? "background:#999;" : "background:#add8e6;";
        echo "<label style='display:inline-block; margin:5px;'>
                <input type='checkbox' name='seats[]' value='$seatID' $disabled style='display:none;' />
                <span class='seat' style='padding:8px 12px; border-radius:4px; cursor:pointer; $style' onclick='toggleSeat(this)'>$seatID</span>
              </label>";
    }
    echo "<br/>";
}
?>
