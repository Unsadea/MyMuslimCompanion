<?php
// ===========================
// FEEDBACK HANDLER — feedback.php
// Saves feedback to MySQL database
// ===========================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$host     = 'localhost';
$dbname   = 'mymuslimcompanion';
$username = 'root';
$password = ''; // XAMPP default is empty password

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Get and sanitize input
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

// Validate inputs
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

if (strlen($name) > 100) {
    echo json_encode(['success' => false, 'message' => 'Name is too long.']);
    exit;
}

if (strlen($message) > 1000) {
    echo json_encode(['success' => false, 'message' => 'Message is too long (max 1000 characters).']);
    exit;
}

// Connect to database
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Insert feedback
    $stmt = $pdo->prepare("INSERT INTO feedback (name, email, message) VALUES (:name, :email, :message)");
    $stmt->execute([
        ':name'    => htmlspecialchars($name),
        ':email'   => htmlspecialchars($email),
        ':message' => htmlspecialchars($message)
    ]);

    echo json_encode(['success' => true, 'message' => 'Thank you for your feedback!']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again later.']);
}
?>
