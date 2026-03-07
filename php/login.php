<?php
// ===========================
// LOGIN — login.php
// ===========================

session_start();
header('Content-Type: application/json');
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please enter your username and password.']);
    exit;
}

// Find user
$stmt = $pdo->prepare("SELECT user_id, username, password FROM users WHERE username = :username");
$stmt->execute([':username' => $username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Incorrect username or password.']);
    exit;
}

// Set session
$_SESSION['user_id']  = $user['user_id'];
$_SESSION['username'] = $user['username'];

echo json_encode(['success' => true, 'message' => 'Login successful!', 'username' => $user['username']]);
?>
