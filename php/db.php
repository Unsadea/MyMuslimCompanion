<?php
// ===========================
// DATABASE CONNECTION — db.php
// ===========================

$host   = 'localhost';
$dbname = 'mymuslimcompanion';
$user   = 'root';
$pass   = ''; // XAMPP default is empty

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}
?>
