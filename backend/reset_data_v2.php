<?php
require 'db.php';
try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    // Use singular names as found in code and list_tables. 
    // `Order` must be quoted.
    $tables = ['OrderItem', '`Order`', 'CartItem', 'Cart', 'Product'];
    
    foreach ($tables as $table) {
        // Remove backticks for display
        $tableName = str_replace('`', '', $table);
        $pdo->exec("TRUNCATE TABLE $table");
        echo "Truncated table: $tableName\n";
    }
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "All data cleared successfully.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
