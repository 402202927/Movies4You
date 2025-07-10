<?php
$conn = new mysqli("localhost", "root", "", "movies4you");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$name = $_POST['name'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Secure hash

$sql = $conn->prepare("INSERT INTO User (Name, Email, Password) VALUES (?, ?, ?)");
$sql->bind_param("sss", $name, $email, $password);

if ($sql->execute()) {
    echo "Registration successful!";
} else {
    echo "Error: " . $sql->error;
}
$conn->close();
?>
