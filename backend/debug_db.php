<?php
require 'db.php';

header('Content-Type: text/plain');

try {
    echo "=== USERS ===\n";
    $stmt = $pdo->query("SELECT user_id, username, email FROM User");
    print_r($stmt->fetchAll());
    
    echo "\n=== PRODUCTS ===\n";
    $stmt = $pdo->query("SELECT product_id, name, seller_id, is_deleted FROM Product");
    print_r($stmt->fetchAll());

    echo "\n=== ORDERS ===\n";
    $stmt = $pdo->query("SELECT * FROM `Order`");
    $orders = $stmt->fetchAll();
    print_r($orders);

    echo "\n=== ORDER ITEMS ===\n";
    $stmt = $pdo->query("SELECT * FROM OrderItem");
    print_r($stmt->fetchAll());

    if (empty($orders)) {
        echo "\n[DIAGNOSIS] No orders found in database. Creation is failing.\n";
    } else {
        echo "\n[DIAGNOSIS] Orders exist. Fetch/Filter Logic might be the issue.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
