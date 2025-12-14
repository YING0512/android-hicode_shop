<?php
require 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. GET Requests
if ($method === 'GET') {
    if ($action === 'list_rooms') {
        // Get all Chat Rooms for a User (Buyer or Seller)
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        if (!$user_id) {
            http_response_code(400); echo json_encode(['error' => 'Missing user_id']); exit;
        }

        // We need to fetch the other party's name as well
        $sql = "SELECT cr.*, 
                       b.username as buyer_name, 
                       s.username as seller_name,
                       (SELECT content FROM ChatMessage cm WHERE cm.chat_room_id = cr.chat_room_id ORDER BY cm.created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM ChatMessage cm WHERE cm.chat_room_id = cr.chat_room_id ORDER BY cm.created_at DESC LIMIT 1) as last_message_time,
                       (SELECT COUNT(*) FROM ChatMessage cm WHERE cm.chat_room_id = cr.chat_room_id AND cm.is_read = 0 AND (cm.sender_id != ? OR cm.sender_id IS NULL)) as unread_count
                FROM ChatRoom cr
                JOIN User b ON cr.buyer_id = b.user_id
                JOIN User s ON cr.seller_id = s.user_id
                WHERE cr.buyer_id = ? OR cr.seller_id = ?
                ORDER BY last_message_time DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, $user_id, $user_id]);
        echo json_encode($stmt->fetchAll());

    } elseif ($action === 'get_messages') {
        // Get Messages for a specific Room
        $room_id = isset($_GET['room_id']) ? $_GET['room_id'] : null;
        if (!$room_id) {
            http_response_code(400); echo json_encode(['error' => 'Missing room_id']); exit;
        }

        $sql = "SELECT cm.*, u.username as sender_name 
                FROM ChatMessage cm 
                LEFT JOIN User u ON cm.sender_id = u.user_id 
                WHERE cm.chat_room_id = ? 
                ORDER BY cm.created_at ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$room_id]);
        echo json_encode($stmt->fetchAll());
    }

} elseif ($method === 'POST') {
    // Send Message OR Mark Read
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? ($data['action'] ?? 'send');

    if ($action === 'mark_read') {
        $room_id = $data['room_id'] ?? null;
        $user_id = $data['user_id'] ?? null; // Current user reading the messages

        if (!$room_id || !$user_id) {
             http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
        }
        
        // Mark texts from OTHER senders as read
        // System messages (sender_id IS NULL) should also be marked read? 
        // For simplicity: Mark ALL unread messages in this room as read where sender is NOT me
        // Actually, system messages affect both? Let's assume system messages are for both to see.
        // But is_read is a single flag. This is a flaw in the simple schema (shared is_read). 
        // Ideally we need separate ReadStatus table.
        // For this simple task, let's assume `is_read` implies "Recipient has read it".
        // Since it's 1-on-1, if I am the sender, I don't need to read it.
        // So we update rows where sender_id != me.
        
        $stmt = $pdo->prepare("UPDATE ChatMessage SET is_read = 1 WHERE chat_room_id = ? AND (sender_id != ? OR sender_id IS NULL) AND is_read = 0");
        $stmt->execute([$room_id, $user_id]);
        
        echo json_encode(['status' => 'marked_read']);
        exit;
    }

    // Default: Send Message
    $room_id = $data['room_id'];
    $sender_id = $data['sender_id'];
    $content = $data['content'];
    $type = isset($data['type']) ? $data['type'] : 'TEXT';

    if (!$room_id || !$content) {
         http_response_code(400); echo json_encode(['error' => 'Missing data']); exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO ChatMessage (chat_room_id, sender_id, message_type, content, is_read) VALUES (?, ?, ?, ?, 0)");
        $stmt->execute([$room_id, $sender_id, $type, $content]);
        echo json_encode(['status' => 'success', 'message_id' => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
