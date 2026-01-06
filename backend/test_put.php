<?php
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$input = file_get_contents('php://input');

file_put_contents('debug_put.txt', "Method: $method\nInput: $input\n", FILE_APPEND);

echo json_encode(['message' => "Received $method", 'input_length' => strlen($input)]);
?>
