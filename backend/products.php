<?php
require 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $seller_id = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : null;
    $category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT p.*, u.username as seller_name FROM Product p JOIN User u ON p.seller_id = u.user_id WHERE p.product_id = ? AND p.is_deleted = 0");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch());
    } elseif ($seller_id) {
        // Seller Dashboard: Show ALL products (on/off shelf) for this seller
        $sql = "SELECT * FROM Product WHERE seller_id = ? AND is_deleted = 0";
        $params = [$seller_id];

        if ($category_id) {
            $sql .= " AND category_id = ?";
            $params[] = $category_id;
        }
        if ($search) {
            $sql .= " AND (name LIKE ? OR description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        $sql .= " ORDER BY product_id DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
    } else {
        // Public List: Show ONLY 'on_shelf' products
        $sql = "SELECT p.*, u.username as seller_name FROM Product p JOIN User u ON p.seller_id = u.user_id WHERE p.is_deleted = 0 AND p.status = 'on_shelf'";
        $params = [];

        if ($category_id) {
            $sql .= " AND p.category_id = ?";
            $params[] = $category_id;
        }
        if ($search) {
            $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        $sql .= " ORDER BY p.product_id DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    // Create Product
    // If Content-Type is multipart/form-data
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? 0;
    $stock_quantity = $_POST['stock_quantity'] ?? 0;
    $category_id = $_POST['category_id'] ?? null;
    $seller_id = $_POST['seller_id'] ?? null; // Ensure seller_id is passed
    $image_url = null;

    if (empty($name) && empty($seller_id)) { // Fallback for raw JSON if multipart/form-data not used or incomplete
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data) {
             $name = $data['name'] ?? '';
             $description = $data['description'] ?? '';
             $price = $data['price'] ?? 0;
             $stock_quantity = $data['stock_quantity'] ?? 0;
             $category_id = $data['category_id'] ?? null;
             $seller_id = $data['seller_id'] ?? null;
        }
    }

    // Verify Category ID exists in database
    if (!empty($category_id) && $category_id > 0) {
        $checkCat = $pdo->prepare("SELECT category_id FROM Category WHERE category_id = ?");
        $checkCat->execute([$category_id]);
        if (!$checkCat->fetch()) {
            $category_id = null; // Category not found, fallback to uncategorized
        }
    } else {
        $category_id = null;
    }

    if (!$seller_id || empty($name) || empty($description) || $price <= 0 || $stock_quantity < 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing or invalid product details (seller_id, name, description, price, stock_quantity are required).']);
        exit();
    }

    // Default status
    $status = isset($_POST['status']) ? $_POST['status'] : 'on_shelf';
    // Auto-off if stock is 0
    if ($stock_quantity <= 0) $status = 'off_shelf';

    // Handle File Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/'; // Relative to the script location
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

        $fileTmpPath = $_FILES['image']['tmp_name'];
        $fileName = $_FILES['image']['name'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));

        $allowedfileExtensions = array('jpg', 'gif', 'png', 'jpeg', 'webp');
        if (in_array($fileExtension, $allowedfileExtensions)) {
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadDir . $newFileName;
            
            if(move_uploaded_file($fileTmpPath, $dest_path)) {
                $image_url = 'backend/' . $dest_path; // Adjust path for frontend access
            }
        }
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO Product (seller_id, name, description, price, stock_quantity, category_id, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$seller_id, $name, $description, $price, $stock_quantity, $category_id, $image_url, $status]);
        
        echo json_encode(['message' => 'Product created', 'id' => $pdo->lastInsertId(), 'image_url' => $image_url]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
         http_response_code(400); echo json_encode(['error' => 'Invalid JSON']); exit();
    }

    $product_id = $_GET['id'] ?? ($data['product_id'] ?? null);
    
    if (isset($_GET['id']) && (!isset($data['product_id']))) {
        // This block might be confused with the DELETE block logic I added to a different file?
        // Let's stick to the update logic.
        $product_id = $data['product_id'];
    }

    $seller_id = $data['seller_id'];

    // Verify ownership
    $stmt = $pdo->prepare("SELECT seller_id FROM Product WHERE product_id = ?");
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();

    if (!$product || $product['seller_id'] != $seller_id) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    // Prepare new values (use existing if not provided)
    $name = isset($data['name']) ? $data['name'] : $product['name'];
    $description = isset($data['description']) ? $data['description'] : $product['description'];
    $price = isset($data['price']) ? $data['price'] : $product['price'];
    $stock = isset($data['stock_quantity']) ? $data['stock_quantity'] : $product['stock_quantity'];
    $category_id = isset($data['category_id']) ? $data['category_id'] : $product['category_id'];
    
    // Verify Category ID exists in database (Update)
    if (!empty($category_id) && $category_id > 0) {
        $checkCat = $pdo->prepare("SELECT category_id FROM Category WHERE category_id = ?");
        $checkCat->execute([$category_id]);
        if (!$checkCat->fetch()) {
            $category_id = null;
        }
    } else {
        $category_id = null;
    }
    $status = isset($data['status']) ? $data['status'] : $product['status'];

    // Rule: If stock is 0, status MUST be off_shelf
    if ($stock <= 0) {
        $status = 'off_shelf';
    }

    $stmt = $pdo->prepare("UPDATE Product SET name=?, description=?, price=?, stock_quantity=?, category_id=?, status=? WHERE product_id=?");
    $stmt->execute([$name, $description, $price, $stock, $category_id, $status, $product_id]);
    
    echo json_encode(['message' => 'Product updated']);

} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $seller_id = $_GET['seller_id'] ?? null;

    if (!$id || !$seller_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing product ID or seller ID']);
        exit;
    }

    // Soft Delete
    $stmt = $pdo->prepare("UPDATE Product SET is_deleted = 1 WHERE product_id = ? AND seller_id = ?");
    $stmt->execute([$id, $seller_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'Product deleted']);
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'Product not found or unauthorized']);
    }
}
?>
