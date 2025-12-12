<?php
require 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    // 結帳
    $user_id = $data['user_id'];
    $shipping_address = $data['shipping_address'];
    
    // 1. 取得購物車商品
    $stmt = $pdo->prepare("SELECT cart_id FROM Cart WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $cart = $stmt->fetch();

    if (!$cart) {
        http_response_code(400);
        echo json_encode(['error' => 'No cart found']);
        exit();
    }

    $cart_id = $cart['cart_id'];
    $stmt = $pdo->prepare("SELECT ci.*, p.price, p.stock_quantity FROM CartItem ci JOIN Product p ON ci.product_id = p.product_id WHERE ci.cart_id = ?");
    $stmt->execute([$cart_id]);
    $items = $stmt->fetchAll();

    if (empty($items)) {
        http_response_code(400);
        echo json_encode(['error' => 'Cart is empty']);
        exit();
    }

    // 計算總金額
    $total_amount = 0;
    foreach ($items as $item) {
        $total_amount += $item['price'] * $item['quantity'];
    }

    // --- 交易開始 ---
    try {
        $pdo->beginTransaction();

        // 1. 檢查使用者餘額
        $stmtBalance = $pdo->prepare("SELECT wallet_balance FROM User WHERE user_id = ? FOR UPDATE");
        $stmtBalance->execute([$user_id]);
        $user = $stmtBalance->fetch();

        if (!$user) {
             throw new Exception("User not found");
        }
        if ($user['wallet_balance'] < $total_amount) {
             throw new Exception("餘額不足 (需要: " . $total_amount . ", 擁有: " . $user['wallet_balance'] . ")");
        }

        // 2. 扣除餘額
        $stmtDeduct = $pdo->prepare("UPDATE User SET wallet_balance = wallet_balance - ? WHERE user_id = ?");
        $stmtDeduct->execute([$total_amount, $user_id]);

        // 3. 建立訂單
        $stmt = $pdo->prepare("INSERT INTO `Order` (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, 'PENDING')");
        $stmt->execute([$user_id, $total_amount, $shipping_address]);
        $order_id = $pdo->lastInsertId();

        // 4. 處理商品 (加入訂單明細、扣除庫存、轉帳給賣家)
        foreach ($items as $item) {
            // 取得賣家 ID
            $stmtSeller = $pdo->prepare("SELECT seller_id FROM Product WHERE product_id = ?");
            $stmtSeller->execute([$item['product_id']]);
            $seller = $stmtSeller->fetch();

            if (!$seller) {
                throw new Exception("Seller not found for Product ID " . $item['product_id']);
            }

            // 檢查庫存
            if ($item['stock_quantity'] < $item['quantity']) {
                throw new Exception("Product ID " . $item['product_id'] . " out of stock");
            }

            // 新增訂單明細
            $stmt = $pdo->prepare("INSERT INTO OrderItem (order_id, product_id, quantity, price_snapshot) VALUES (?, ?, ?, ?)");
            $stmt->execute([$order_id, $item['product_id'], $item['quantity'], $item['price']]);

            // 扣除庫存並增加銷售量
            $stmt = $pdo->prepare("UPDATE Product SET stock_quantity = stock_quantity - ?, sales_count = sales_count + ? WHERE product_id = ? AND stock_quantity >= ?");
            $stmt->execute([$item['quantity'], $item['quantity'], $item['product_id'], $item['quantity']]);
            
            if ($stmt->rowCount() == 0) {
                // 庫存不足或是併發更新失敗
                throw new Exception("Product ID " . $item['product_id'] . " stock insufficient during update");
            }

            // 轉帳給賣家
            $itemTotal = $item['price'] * $item['quantity'];
            $stmtTransfer = $pdo->prepare("UPDATE User SET wallet_balance = wallet_balance + ? WHERE user_id = ?");
            $stmtTransfer->execute([$itemTotal, $seller['seller_id']]);

            // Check if stock became 0, if so, set status to off_shelf
            $stmtCheck = $pdo->prepare("SELECT stock_quantity FROM Product WHERE product_id = ?");
            $stmtCheck->execute([$item['product_id']]);
            $prod = $stmtCheck->fetch();
            if ($prod && $prod['stock_quantity'] <= 0) {
                $stmtUpdateStatus = $pdo->prepare("UPDATE Product SET status = 'off_shelf' WHERE product_id = ?");
                $stmtUpdateStatus->execute([$item['product_id']]);
            }
        }

        // 5. Clear Cart
        $stmt = $pdo->prepare("DELETE FROM CartItem WHERE cart_id = ?");
        $stmt->execute([$cart_id]);
        
        $pdo->commit();
        echo json_encode(['message' => 'Order placed successfully', 'order_id' => $order_id]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['error' => 'Order failed: ' . $e->getMessage()]);
    }
    // --- TRANSACTION END ---

} elseif ($method === 'PUT') {
    // Cancel Order
    $data = json_decode(file_get_contents('php://input'), true);
    $order_id = $data['order_id'];
    $user_id = $data['user_id'];
    $action = $data['action'] ?? '';

    if ($action === 'cancel') {
        $reason = $data['reason'] ?? 'User cancelled';

        // 1. Get Order Status
        $stmt = $pdo->prepare("SELECT status FROM `Order` WHERE order_id = ?");
        $stmt->execute([$order_id]);
        $order = $stmt->fetch();

        if (!$order || $order['status'] !== 'PENDING') {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot cancel order (invalid status)']);
            exit();
        }

        // 2. Start Transaction
        $pdo->beginTransaction();
        try {
            // Update Status
            $stmt = $pdo->prepare("UPDATE `Order` SET status = 'CANCELLED', cancellation_reason = ? WHERE order_id = ?");
            $stmt->execute([$reason, $order_id]);

            // Restore Stock
            $stmt = $pdo->prepare("SELECT product_id, quantity FROM OrderItem WHERE order_id = ?");
            $stmt->execute([$order_id]);
            $items = $stmt->fetchAll();

            foreach ($items as $item) {
                // Update stock and sales
                $stmt = $pdo->prepare("UPDATE Product SET stock_quantity = stock_quantity + ?, sales_count = sales_count - ? WHERE product_id = ?");
                $stmt->execute([$item['quantity'], $item['quantity'], $item['product_id']]);
                
                // Check if stock became 0, if so, set status to off_shelf
                $stmtCheck = $pdo->prepare("SELECT stock_quantity FROM Product WHERE product_id = ?");
                $stmtCheck->execute([$item['product_id']]);
                $prod = $stmtCheck->fetch();
                if ($prod && $prod['stock_quantity'] <= 0) {
                    $stmtUpdateStatus = $pdo->prepare("UPDATE Product SET status = 'off_shelf' WHERE product_id = ?");
                    $stmtUpdateStatus->execute([$item['product_id']]);
                }
            }

            $pdo->commit();
            echo json_encode(['message' => 'Order cancelled']);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to cancel order: ' . $e->getMessage()]);
        }
    } elseif ($action === 'complete') {
        // Seller actions: Mark as completed
         // Verify permission in a real app, assuming logic here is checked by caller (SellerDashboard only sends if authorized)
        $stmt = $pdo->prepare("UPDATE `Order` SET status = 'COMPLETED' WHERE order_id = ?");
        $stmt->execute([$order_id]);
        echo json_encode(['message' => 'Order marked as completed']);
    }
} elseif ($method === 'GET') {
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $seller_id = isset($_GET['seller_id']) ? $_GET['seller_id'] : null;

    $ordersMap = [];

    if ($user_id) {
        // Buyer: Get their orders + items
        $sql = "SELECT o.*, oi.quantity, oi.price_snapshot, p.name as product_name, p.image_url 
                FROM `Order` o 
                LEFT JOIN OrderItem oi ON o.order_id = oi.order_id 
                LEFT JOIN Product p ON oi.product_id = p.product_id 
                WHERE o.user_id = ? 
                ORDER BY o.order_date DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        $rows = $stmt->fetchAll();

    } elseif ($seller_id) {
        // Seller: Get orders containing their products
        // Note: For a seller view, we might only want to show ITEMS that belong to them?
        // But usually an order is a unit. If we show the whole order, we should probably show all items or just theirs.
        // Let's filter to show only THEIR items in the details to avoid confusion/privacy issues, 
        // OR show all but highlight theirs.
        // For simplicity: Show only matching items (since we query by seller_id).
        
        $sql = "SELECT o.*, oi.quantity, oi.price_snapshot, p.name as product_name, p.image_url 
                FROM `Order` o 
                JOIN OrderItem oi ON o.order_id = oi.order_id 
                JOIN Product p ON oi.product_id = p.product_id 
                WHERE p.seller_id = ? 
                ORDER BY o.order_date DESC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$seller_id]);
        $rows = $stmt->fetchAll();
    } else {
        echo json_encode([]);
        exit;
    }

    // Aggregate in PHP
    foreach ($rows as $row) {
        $order_id = $row['order_id'];
        if (!isset($ordersMap[$order_id])) {
            $ordersMap[$order_id] = [
                'order_id' => $row['order_id'],
                'user_id' => $row['user_id'],
                'total_amount' => $row['total_amount'],
                'status' => $row['status'],
                'shipping_address' => $row['shipping_address'],
                'order_date' => $row['order_date'],
                'cancellation_reason' => $row['cancellation_reason'],
                'items' => []
            ];
        }
        
        if ($row['product_name']) { // If there is an item
            $ordersMap[$order_id]['items'][] = [
                'name' => $row['product_name'],
                'price' => $row['price_snapshot'],
                'quantity' => $row['quantity'],
                'image_url' => $row['image_url']
            ];
        }
    }

    echo json_encode(array_values($ordersMap));
}
?>
