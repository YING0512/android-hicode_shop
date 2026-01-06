<?php
// backend/permissions.php

// 檢查使用者是否有指定角色
function checkRole($pdo, $user_id, $required_roles) {
    if (!$user_id) return false;

    // 如果 required_roles 是單一字串，轉為陣列
    if (!is_array($required_roles)) {
        $required_roles = [$required_roles];
    }

    $stmt = $pdo->prepare("SELECT role FROM User WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if ($user && in_array($user['role'], $required_roles)) {
        return true;
    }
    return false;
}

// 檢查是否為管理員
function checkAdmin($pdo, $user_id) {
    return checkRole($pdo, $user_id, 'admin');
}

// 檢查是否為賣家 (Admin 擁有賣家權限)
function checkSeller($pdo, $user_id) {
    // 允許 'seller' 或 'admin'
    return checkRole($pdo, $user_id, ['seller', 'admin']);
}

// 檢查是否為一般使用者 (買家)
// 賣家與管理員也都擁有買家權限 (購買、聊天、錢包)
function checkUser($pdo, $user_id) {
    // 允許 'user' (買家), 'seller', 'admin'
    return checkRole($pdo, $user_id, ['user', 'seller', 'admin']);
}

// 通用權限與存在性檢查輔助函數
// 若驗證失敗直接回傳 JSON Error 並 exit
function requireAuth($user_id) {
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required (missing user_id)']);
        exit();
    }
}

function requireRole($pdo, $user_id, $roles) {
    requireAuth($user_id);
    if (!checkRole($pdo, $user_id, $roles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Permission denied']);
        exit();
    }
}
?>
