<?php
require 'db.php';

echo "Updating Schema v7 (Multi-use Codes)...<br>";

try {
    // 1. Modify RedemptionCode Table
    // We need to drop the single-use columns and add counter columns.
    // NOTE: This might lose old usage data if we just drop. 
    // Ideally we migrate, but for dev we can just drop/add or alter.
    
    // Check if max_uses exists
    $columns = $pdo->query("SHOW COLUMNS FROM RedemptionCode LIKE 'max_uses'")->fetchAll();
    if (count($columns) == 0) {
        // Add new columns
        $pdo->exec("ALTER TABLE RedemptionCode ADD COLUMN max_uses INT NOT NULL DEFAULT 1");
        $pdo->exec("ALTER TABLE RedemptionCode ADD COLUMN current_uses INT NOT NULL DEFAULT 0");
        echo "Added max_uses and current_uses columns.<br>";
        
        // Migrate data: if is_used=1, set current_uses=1?
        // We'll skip complex migration for now and just set up structure.
    }

    // 2. Create RedemptionHistory Table
    // This tracks WHO used WHICH code, ensuring one person uses a code only once (if that's the rule).
    // Usually multi-use codes are "once per user, but valid N times total".
    $sql = "CREATE TABLE IF NOT EXISTS RedemptionHistory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code_id INT NOT NULL,
        user_id INT NOT NULL,
        redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (code_id) REFERENCES RedemptionCode(code_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES User(user_id),
        UNIQUE KEY unique_redemption (code_id, user_id)
    ) ENGINE=InnoDB;";
    $pdo->exec($sql);
    echo "Created RedemptionHistory table.<br>";

    // 3. Drop old columns if they exist (optional cleanup)
    // $pdo->exec("ALTER TABLE RedemptionCode DROP COLUMN is_used");
    // $pdo->exec("ALTER TABLE RedemptionCode DROP COLUMN used_by_user_id"); 
    // $pdo->exec("ALTER TABLE RedemptionCode DROP COLUMN used_at");
    // echo "Cleaned up old columns.<br>";

    // If we keep old columns for backward compatibility, we just ignore them in new code.
    // Let's keep them for safety but rely on new columns.

    echo "Schema Update v7 Complete!";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
?>
