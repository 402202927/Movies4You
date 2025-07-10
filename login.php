<?php
session_start(); 
$conn = new mysqli("localhost", "root", "", "movies4you");

$email = $_POST['email'];
$password = $_POST['password'];

$sql = $conn->prepare("SELECT UserID, Password FROM User WHERE Email = ?");
$sql->bind_param("s", $email);
$sql->execute();
$result = $sql->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['Password'])) {
        $_SESSION['UserID'] = $user['UserID']; 
        header("Location: index.html"); // 
        exit;
    } else {
        echo "Incorrect password.";
    }
} else {
    echo "User not found.";
}
$conn->close();
?>

