<?php
require 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 取得錢包餘額
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    if (!$user_id) {
        http_response_code(400); echo json_encode(['error' => 'Missing user_id']); exit;
    }

    $stmt = $pdo->prepare("SELECT wallet_balance, role FROM User WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode(['balance' => floatval($user['wallet_balance']), 'role' => $user['role']]);
    } else {
        http_response_code(404); echo json_encode(['error' => 'User not found']);
    }

} elseif ($method === 'POST') {
    // 兌換代碼
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $data['user_id'] ?? null;
    $code = $data['code'] ?? '';

    if (!$user_id || empty($code)) {
        http_response_code(400); echo json_encode(['error' => 'Missing user_id or code']); exit;
    }

    try {
        $pdo->beginTransaction();

        // 檢查代碼
        $stmt = $pdo->prepare("SELECT * FROM RedemptionCode WHERE code = ? FOR UPDATE");
        $stmt->execute([$code]);
        $rc = $stmt->fetch();

        if (!$rc) {
            throw new Exception("無效的代碼");
        }
        
        // 檢查使用次數上限
        if ($rc['current_uses'] >= $rc['max_uses']) {
            throw new Exception("此代碼已達到使用上限");
        }

        // 檢查使用者是否已使用過此代碼
        $stmtHistory = $pdo->prepare("SELECT * FROM RedemptionHistory WHERE code_id = ? AND user_id = ?");
        $stmtHistory->execute([$rc['code_id'], $user_id]);
        if ($stmtHistory->fetch()) {
             throw new Exception("您已領取過此代碼");
        }

        // 更新使用統計
        $stmt = $pdo->prepare("UPDATE RedemptionCode SET current_uses = current_uses + 1 WHERE code_id = ?");
        $stmt->execute([$rc['code_id']]);

        // 新增使用記錄
        $stmt = $pdo->prepare("INSERT INTO RedemptionHistory (code_id, user_id) VALUES (?, ?)");
        $stmt->execute([$rc['code_id'], $user_id]);

        // 增加錢包餘額
        $stmt = $pdo->prepare("UPDATE User SET wallet_balance = wallet_balance + ? WHERE user_id = ?");
        $stmt->execute([$rc['value'], $user_id]);

        $pdo->commit();
        echo json_encode(['message' => '儲值成功', 'added_value' => $rc['value']]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
