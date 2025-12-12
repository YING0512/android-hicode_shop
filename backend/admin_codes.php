<?php
require 'db.php';
header('Content-Type: application/json');

// 簡易管理員檢查 (實際應用中應驗證 session/token)
// 目前我們先信任客戶端知曉 user_id，並每次從資料庫檢查權限。

$method = $_SERVER['REQUEST_METHOD'];

// 檢查管理員身份的輔助函數
function checkAdmin($pdo, $user_id) {
    if (!$user_id) return false;
    $stmt = $pdo->prepare("SELECT role FROM User WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    return ($user && $user['role'] === 'admin');
}

if ($method === 'GET') {
    // 列出代碼
    $admin_id = $_GET['admin_id'] ?? null;
    if (!checkAdmin($pdo, $admin_id)) {
         http_response_code(403); echo json_encode(['error' => 'Unauthorized']); exit;
    }

    // 列出代碼 (顯示使用次數)
    $stmt = $pdo->query("SELECT * FROM RedemptionCode ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll());

} elseif ($method === 'POST') {
    // 建立代碼
    $data = json_decode(file_get_contents('php://input'), true);
    $admin_id = $data['admin_id'] ?? null;
    
    if (!checkAdmin($pdo, $admin_id)) {
         http_response_code(403); echo json_encode(['error' => 'Unauthorized']); exit;
    }

    $code = $data['code'] ?? '';
    $value = $data['value'] ?? 0;
    $max_uses = $data['max_uses'] ?? 1; // 預設 1

    if (empty($code) || $value <= 0 || $max_uses < 1) {
        http_response_code(400); echo json_encode(['error' => 'Invalid code, value, or usage limit']); exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO RedemptionCode (code, value, max_uses) VALUES (?, ?, ?)");
        $stmt->execute([$code, $value, $max_uses]);
        echo json_encode(['message' => 'Created code successfully', 'code' => $code]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
             http_response_code(400); echo json_encode(['error' => 'Code already exists']);
        } else {
             http_response_code(500); echo json_encode(['error' => 'Database error']);
        }
    }

} elseif ($method === 'DELETE') {
    // 刪除代碼
    $admin_id = $_GET['admin_id'] ?? null;
    $code_id = $_GET['code_id'] ?? null;

    if (!checkAdmin($pdo, $admin_id)) {
        http_response_code(403); echo json_encode(['error' => 'Unauthorized']); exit;
    }

    $stmt = $pdo->prepare("DELETE FROM RedemptionCode WHERE code_id = ?");
    $stmt->execute([$code_id]);
    echo json_encode(['message' => 'Deleted']);
}
?>
