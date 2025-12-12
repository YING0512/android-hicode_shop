<?php
require 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);

// Assume user_id is passed in header or query for simplicity in this demo environment
// In production, extract from JWT
$headers = getallheaders();
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : (isset($data['user_id']) ? intval($data['user_id']) : null);

if (!$user_id) {
    // For POST/PUT/DELETE we need user context
    if ($method !== 'OPTIONS') {
         // Allow creating a temporary cart? No, enforce user for now based on schema (user_id is NOT NULL in Cart)
         // But wait, schema says user_id is FK.
    }
}

if ($method === 'GET') {
    if (!$user_id) { echo json_encode([]); exit(); }

    // Get Cart
    $stmt = $pdo->prepare("SELECT c.cart_id FROM Cart c WHERE c.user_id = ?");
    $stmt->execute([$user_id]);
    $cart = $stmt->fetch();

    if ($cart) {
        $stmt = $pdo->prepare("
            SELECT ci.*, p.name, p.price, p.stock_quantity 
            FROM CartItem ci 
            JOIN Product p ON ci.product_id = p.product_id 
            WHERE ci.cart_id = ?
        ");
        $stmt->execute([$cart['cart_id']]);
        echo json_encode(['cart_id' => $cart['cart_id'], 'items' => $stmt->fetchAll()]);
    } else {
        echo json_encode(['message' => 'Cart empty', 'items' => []]);
    }

} elseif ($method === 'POST') {
    // Add to Cart
    if (!$user_id) { http_response_code(401); echo json_encode(['error' => 'User ID required']); exit(); }
    
    $product_id = $data['product_id'];
    $quantity = isset($data['quantity']) ? $data['quantity'] : 1;

    // 1. Get or Create Cart
    $stmt = $pdo->prepare("SELECT cart_id FROM Cart WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $cart = $stmt->fetch();
    
    if (!$cart) {
        $stmt = $pdo->prepare("INSERT INTO Cart (user_id) VALUES (?)");
        $stmt->execute([$user_id]);
        $cart_id = $pdo->lastInsertId();
    } else {
        $cart_id = $cart['cart_id'];
    }

    // 2. Add/Update Item
    // Check if item exists in cart
    $stmt = $pdo->prepare("SELECT cart_item_id, quantity FROM CartItem WHERE cart_id = ? AND product_id = ?");
    $stmt->execute([$cart_id, $product_id]);
    $existing = $stmt->fetch();

    if ($existing) {
        $new_qty = $existing['quantity'] + $quantity;
        $stmt = $pdo->prepare("UPDATE CartItem SET quantity = ? WHERE cart_item_id = ?");
        $stmt->execute([$new_qty, $existing['cart_item_id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO CartItem (cart_id, product_id, quantity) VALUES (?, ?, ?)");
        $stmt->execute([$cart_id, $product_id, $quantity]);
    }

    echo json_encode(['message' => 'Added to cart', 'cart_id' => $cart_id]);

} elseif ($method === 'DELETE') {
    // Remove from Cart
    if (!$user_id) { http_response_code(401); echo json_encode(['error' => 'User ID required']); exit(); }

    $cart_item_id = isset($_GET['cart_item_id']) ? $_GET['cart_item_id'] : (isset($data['cart_item_id']) ? $data['cart_item_id'] : null);
    
    // Also allow clearing by product_id if convenient, but cart_item_id is safer
    // Let's support cart_item_id primarily
    
    if (!$cart_item_id) {
        http_response_code(400); echo json_encode(['error' => 'Cart Item ID required']); exit();
    }

    // Verify ownership (optional but good) -> User owns the cart that owns the item
    // For simplicity, just delete where cart_id in (select cart_id from cart where user_id=?)
    
    $stmt = $pdo->prepare("DELETE FROM CartItem WHERE cart_item_id = ? AND cart_id IN (SELECT cart_id FROM Cart WHERE user_id = ?)");
    $stmt->execute([$cart_item_id, $user_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'Item removed']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found or not authorized']);
    }
}
?>
