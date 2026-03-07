<?php
// ===========================
// BOOKMARK — bookmark.php
// Handles save, remove and get bookmarks
// Supports both Surah and Verse bookmarks
// ===========================

session_start();
header('Content-Type: application/json');
require 'db.php';

// Must be logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Please login to use bookmarks.']);
    exit;
}

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// ===========================
// GET ALL BOOKMARKS
// ===========================
if ($action === 'get') {
    $stmt = $pdo->prepare("SELECT surah_number, surah_name, verse_number, verse_text, saved_at FROM bookmarks WHERE user_id = :user_id ORDER BY saved_at DESC");
    $stmt->execute([':user_id' => $userId]);
    $bookmarks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'bookmarks' => $bookmarks]);
    exit;
}

// ===========================
// SAVE BOOKMARK (Surah or Verse)
// ===========================
if ($action === 'save') {
    $surahNumber = intval($_POST['surah_number'] ?? 0);
    $surahName   = trim($_POST['surah_name'] ?? '');
    $verseNumber = intval($_POST['verse_number'] ?? 0) ?: null;
    $verseText   = trim($_POST['verse_text'] ?? '') ?: null;

    if (!$surahNumber || empty($surahName)) {
        echo json_encode(['success' => false, 'message' => 'Invalid Surah data.']);
        exit;
    }

    // Check if already bookmarked
    if ($verseNumber) {
        // Verse bookmark check
        $stmt = $pdo->prepare("SELECT bookmark_id FROM bookmarks WHERE user_id = :user_id AND surah_number = :surah_number AND verse_number = :verse_number");
        $stmt->execute([':user_id' => $userId, ':surah_number' => $surahNumber, ':verse_number' => $verseNumber]);
    } else {
        // Surah bookmark check
        $stmt = $pdo->prepare("SELECT bookmark_id FROM bookmarks WHERE user_id = :user_id AND surah_number = :surah_number AND verse_number IS NULL");
        $stmt->execute([':user_id' => $userId, ':surah_number' => $surahNumber]);
    }

    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Already bookmarked!']);
        exit;
    }

    // Insert bookmark
    $stmt = $pdo->prepare("INSERT INTO bookmarks (user_id, surah_number, surah_name, verse_number, verse_text) VALUES (:user_id, :surah_number, :surah_name, :verse_number, :verse_text)");
    $stmt->execute([
        ':user_id'      => $userId,
        ':surah_number' => $surahNumber,
        ':surah_name'   => $surahName,
        ':verse_number' => $verseNumber,
        ':verse_text'   => $verseText
    ]);

    $type = $verseNumber ? 'Verse bookmarked!' : 'Surah bookmarked!';
    echo json_encode(['success' => true, 'message' => $type]);
    exit;
}

// ===========================
// REMOVE BOOKMARK
// ===========================
if ($action === 'remove') {
    $surahNumber = intval($_POST['surah_number'] ?? 0);
    $verseNumber = intval($_POST['verse_number'] ?? 0) ?: null;

    if (!$surahNumber) {
        echo json_encode(['success' => false, 'message' => 'Invalid data.']);
        exit;
    }

    if ($verseNumber) {
        $stmt = $pdo->prepare("DELETE FROM bookmarks WHERE user_id = :user_id AND surah_number = :surah_number AND verse_number = :verse_number");
        $stmt->execute([':user_id' => $userId, ':surah_number' => $surahNumber, ':verse_number' => $verseNumber]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM bookmarks WHERE user_id = :user_id AND surah_number = :surah_number AND verse_number IS NULL");
        $stmt->execute([':user_id' => $userId, ':surah_number' => $surahNumber]);
    }

    echo json_encode(['success' => true, 'message' => 'Bookmark removed.']);
    exit;
}

// ===========================
// CHECK SESSION
// ===========================
if ($action === 'check') {
    echo json_encode([
        'success'  => true,
        'loggedIn' => true,
        'username' => $_SESSION['username']
    ]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);
?>
