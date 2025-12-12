<?php
require 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'register') {
        $username = $data['username'];
        $email = $data['email'];
        $password = $data['password'];
        
        // Simple validation
        if (!$username || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing fields']);
            exit();
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);

        try {
            $stmt = $pdo->prepare("INSERT INTO User (username, email, password_hash) VALUES (?, ?, ?)");
            $stmt->execute([$username, $email, $hash]);
            echo json_encode(['message' => 'User registered successfully', 'user_id' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(['error' => 'User already exists or other database error']);
        }

    } elseif ($action === 'login') {
        $email = $data['email'];
        $password = $data['password'];

        $stmt = $pdo->prepare("SELECT * FROM User WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // In a real app, return a JWT token. Here we return the user info for simplicity.
            unset($user['password_hash']);
            echo json_encode(['message' => 'Login successful', 'user' => $user]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
    }
}
?>
