<?php
require 'db.php';

try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Schema uses 'category_name', NOT 'name'
    $sql = "INSERT INTO Category (category_id, category_name) VALUES 
            (1, 'Electronics'),
            (2, 'Books'),
            (3, 'Clothing'),
            (4, 'Home & Garden')
            ON DUPLICATE KEY UPDATE category_name = VALUES(category_name)";
            
    $pdo->exec($sql);
    
    $stmt = $pdo->query("SELECT * FROM Category");
    $cats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($cats) > 0) {
        echo "SUCCESS: Categories seeded. Count: " . count($cats) . "\n";
        print_r($cats);
    } else {
        echo "FAILURE: Category table is still empty.\n";
    }
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
