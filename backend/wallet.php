<?php
// 引入資料庫連線設定
require 'db.php';
require 'permissions.php'; // 引入權限檢查

// 設定回應內容為 JSON 格式
header('Content-Type: application/json');

// 取得 HTTP 請求方法
$method = $_SERVER['REQUEST_METHOD'];

// ----------------------------------------------------------------
// 1. 處理讀取請求 (GET) - 查詢餘額
// ----------------------------------------------------------------
if ($method === 'GET') {
    // 取得錢包餘額
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    requireAuth($user_id); // 確保有提供 user_id


    // 查詢 Users 表，取得餘額與權限角色
    $stmt = $pdo->prepare("SELECT wallet_balance, role FROM User WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode(['balance' => floatval($user['wallet_balance']), 'role' => $user['role']]);
    } else {
        http_response_code(404); echo json_encode(['error' => 'User not found']);
    }

// ----------------------------------------------------------------
// 2. 處理寫入請求 (POST) - 儲值 (兌換代碼)
// ----------------------------------------------------------------
} elseif ($method === 'POST') {
    // 讀取 JSON input
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $data['user_id'] ?? null;
    $code = $data['code'] ?? '';

    if (!$user_id || empty($code)) {
        http_response_code(400); echo json_encode(['error' => 'Missing user_id or code']); exit;
    }


    // 開始交易 (Transaction) 確保兌換過程的一致性
    try {
        $pdo->beginTransaction();

        // (1) 鎖定代碼 (Pessimistic Locking)
        // 使用 FOR UPDATE 鎖定該代碼，避免多人同時兌換同一個限量代碼
        $stmt = $pdo->prepare("SELECT * FROM RedemptionCode WHERE code = ? FOR UPDATE");
        $stmt->execute([$code]);
        $rc = $stmt->fetch();

        if (!$rc) {
            throw new Exception("無效的代碼");
        }
        
        // (2) 驗證資格 (Validation)
        // 檢查使用次數上限
        if ($rc['current_uses'] >= $rc['max_uses']) {
            throw new Exception("此代碼已達到使用上限");
        }

        // 檢查使用者是否已使用過此代碼 (避免重複領取)
        $stmtHistory = $pdo->prepare("SELECT id FROM RedemptionHistory WHERE code_id = ? AND user_id = ?");
        $stmtHistory->execute([$rc['code_id'], $user_id]);
        if ($stmtHistory->fetch()) {
             throw new Exception("您已領取過此代碼");
        }

        // (3) 執行更新 (Execution)
        // 扣除次數 (current_uses + 1)
        $stmt = $pdo->prepare("UPDATE RedemptionCode SET current_uses = current_uses + 1 WHERE code_id = ?");
        $stmt->execute([$rc['code_id']]);

        // 寫入歷史
        $stmt = $pdo->prepare("INSERT INTO RedemptionHistory (code_id, user_id) VALUES (?, ?)");
        $stmt->execute([$rc['code_id'], $user_id]);

        // 增加使用者錢包餘額
        $stmt = $pdo->prepare("UPDATE User SET wallet_balance = wallet_balance + ? WHERE user_id = ?");
        $stmt->execute([$rc['value'], $user_id]);

        // (4) 提交交易 (Commit)
        $pdo->commit();
        echo json_encode(['message' => '儲值成功', 'added_value' => $rc['value']]);

    } catch (Exception $e) {
        // 若發生錯誤則回滾 (Rollback)
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
