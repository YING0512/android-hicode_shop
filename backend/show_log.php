<?php
header('Content-Type: text/plain');
$logFile = 'debug_log.txt';
if (file_exists($logFile)) {
    echo "--- Start of Log ---\n";
    echo file_get_contents($logFile);
    echo "\n--- End of Log ---";
} else {
    echo "Log file not found in " . __DIR__;
    // Try to list files to see if we are crazy
    echo "\n\nFiles in directory:\n";
    print_r(scandir(__DIR__));
}
?>
