<?php
require 'db.php';

try {
    // Disable foreign key checks to allow truncation/deletion in any order
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    $pdo->exec("DELETE FROM OrderItem");
    $pdo->exec("DELETE FROM `Order`"); // Order is reserved
    $pdo->exec("DELETE FROM CartItem");
    // $pdo->exec("DELETE FROM Cart"); // Optional, keep carts to avoid re-creating for users
    $pdo->exec("DELETE FROM Product");

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "Database cleaned: Products, Orders, OrderItems, CartItems deleted.";
} catch (PDOException $e) {
    http_response_code(500);
    echo "Error: " . $e->getMessage();
}
