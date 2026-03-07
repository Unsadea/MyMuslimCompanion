<?php
// ===========================
// SESSION CHECK — session_check.php
// Returns current login status
// ===========================

session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'loggedIn' => true,
        'username' => $_SESSION['username'],
        'user_id'  => $_SESSION['user_id']
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>
