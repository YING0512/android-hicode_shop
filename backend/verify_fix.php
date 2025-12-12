<?php
// Test script to verify product creation with invalid category_id
$url = 'http://localhost/1208/backend/products.php';

$data = [
    'name' => 'Test Product ' . time(),
    'description' => 'Test Description',
    'price' => 100,
    'stock_quantity' => 10,
    'category_id' => '', // Empty string, should be converted to NULL
    'seller_id' => 1,
    'status' => 'on_shelf'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data)); // Simulate form data
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Response Code: " . $httpCode . "\n";
echo "Response Body: " . $response . "\n";
?>
