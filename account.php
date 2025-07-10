<?php
session_start();
if (isset($_SESSION['UserID'])) {
    $userID = $_SESSION['UserID'];
    echo "<p>Welcome back! Your user ID is $userID</p>";
    // Fetch and show booking history from DB using $userID
} else {
    echo "<p>Please log in to view your account.</p>";
}
?>