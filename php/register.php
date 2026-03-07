<?php
// ===========================
// REGISTER — register.php
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
$confirm  = trim($_POST['confirm'] ?? '');

// Validate
if (empty($username) || empty($password) || empty($confirm)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (strlen($username) < 3 || strlen($username) > 50) {
    echo json_encode(['success' => false, 'message' => 'Username must be between 3 and 50 characters.']);
    exit;
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    echo json_encode(['success' => false, 'message' => 'Username can only contain letters, numbers and underscores.']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

if ($password !== $confirm) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
    exit;
}

// Check if username already exists
$stmt = $pdo->prepare("SELECT user_id FROM users WHERE username = :username");
$stmt->execute([':username' => $username]);

if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Username already taken. Please choose another.']);
    exit;
}

// Hash password and insert user
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
$stmt->execute([':username' => $username, ':password' => $hashedPassword]);

$userId = $pdo->lastInsertId();

// Auto login after register
$_SESSION['user_id']  = $userId;
$_SESSION['username'] = $username;

echo json_encode(['success' => true, 'message' => 'Account created successfully!', 'username' => $username]);
?>
