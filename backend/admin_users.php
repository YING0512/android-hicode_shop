<?php
require 'db.php';
header('Content-Type: application/json');

// 檢查管理員身份
$admin_id = $_GET['admin_id'] ?? null;
// 簡易檢查邏輯 (在實際應用中應使用 session/token)
if (!$admin_id) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$stmtCheck = $pdo->prepare("SELECT role FROM User WHERE user_id = ?");
$stmtCheck->execute([$admin_id]);
$callingUser = $stmtCheck->fetch();

if (!$callingUser || $callingUser['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 列出使用者
    // 僅取得基本資訊 + 權限 + 餘額
    $stmt = $pdo->query("SELECT user_id, username, email, role, wallet_balance, registration_date FROM User ORDER BY registration_date DESC");
    echo json_encode($stmt->fetchAll());

} elseif ($method === 'PUT') {
    // 切換權限 (升級/降級)
    $data = json_decode(file_get_contents('php://input'), true);
    $target_user_id = $data['user_id'] ?? null;
    $new_role = $data['role'] ?? null; // 'user', 'seller', 'admin'

    // 驗證權限
    $allowed_roles = ['user', 'seller', 'admin'];
    if (!in_array($new_role, $allowed_roles)) {
        http_response_code(400); 
        echo json_encode(['error' => 'Invalid role']); 
        exit;
    }

    // 防止移除自己的管理員權限 (如果是重要操作)
    if ($target_user_id == $admin_id && $new_role !== 'admin') {
         // 可選擇阻止自我降級，但若使用者希望如此則允許。
         // 目前允許標準更新操作。
    }

    $stmt = $pdo->prepare("UPDATE User SET role = ? WHERE user_id = ?");
    $stmt->execute([$new_role, $target_user_id]);
    
    echo json_encode(['message' => 'User role updated']);
}
?>
