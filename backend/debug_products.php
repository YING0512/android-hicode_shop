<?php
require 'db.php';
function dumpTable($pdo, $name) {
    echo "\n--- $name ---\n";
    try {
        $stmt = $pdo->query("SELECT * FROM `$name`");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "COUNT: " . count($rows) . "\n";
        print_r($rows);
    } catch (Exception $e) { echo "Error: " . $e->getMessage() . "\n"; }
}

dumpTable($pdo, 'User');
dumpTable($pdo, 'Category');
dumpTable($pdo, 'Product');
