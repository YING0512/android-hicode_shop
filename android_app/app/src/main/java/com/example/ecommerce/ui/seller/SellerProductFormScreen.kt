package com.example.ecommerce.ui.seller

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.ecommerce.viewmodel.SellerViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerProductFormScreen(navController: NavController, productId: Int, viewModel: SellerViewModel = viewModel()) {
    // Ideally, we load product details if productId > 0.
    // For simplicity, we might skip pre-filling or do it via a separate state in VM.
    // Since current VM doesn't have "getProductById" exposed easily for UI state reuse, 
    // we assume "Add Product" flow mostly or require fetching.
    
    // NOTE: For full implementation, we need to fetch product details if editing.
    // Given the constraints and time, I'll implement the UI structure. 
    // Real editing would require populating these fields.

    var name by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var stock by remember { mutableStateOf("") }
    
    val isEditing = productId > 0
    val editProduct by viewModel.editProductState.collectAsState()
    val context = androidx.compose.ui.platform.LocalContext.current

    LaunchedEffect(productId) {
        if (isEditing) {
            viewModel.loadProductForEdit(productId)
        } else {
            viewModel.clearEditProduct()
        }
    }

    LaunchedEffect(editProduct) {
        editProduct?.let {
            name = it.name
            description = it.description
            price = it.price.toString()
            stock = it.stockQuantity.toString()
        }
    }

    val operationState by viewModel.productOperationState.collectAsState()

    LaunchedEffect(operationState) {
        when (val state = operationState) {
            is SellerViewModel.ProductOperationState.Success -> {
                android.widget.Toast.makeText(context, "操作成功", android.widget.Toast.LENGTH_SHORT).show()
                viewModel.resetProductOperationState()
                navController.popBackStack()
            }
            is SellerViewModel.ProductOperationState.Error -> {
                android.widget.Toast.makeText(context, state.message, android.widget.Toast.LENGTH_LONG).show()
                viewModel.resetProductOperationState() // Reset so we can try again
            }
            else -> {}
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isEditing) "編輯商品" else "新增商品") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // ... same fields ...
                if (isEditing) {
                    Text("編輯商品 ID: $productId", style = MaterialTheme.typography.bodySmall)
                    Spacer(modifier = Modifier.height(16.dp))
                }
                
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("商品名稱") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("商品描述") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3
                )
                Spacer(modifier = Modifier.height(8.dp))
    
                OutlinedTextField(
                    value = price,
                    onValueChange = { price = it },
                    label = { Text("價格") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
    
                OutlinedTextField(
                    value = stock,
                    onValueChange = { stock = it },
                    label = { Text("庫存數量") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(24.dp))
                
                Button(
                    onClick = {
                        if (name.isBlank() || price.isBlank() || stock.isBlank()) {
                            android.widget.Toast.makeText(context, "請填寫名稱、價格與庫存", android.widget.Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        val p = price.toDoubleOrNull() ?: 0.0
                        val s = stock.toIntOrNull() ?: 0
                        
                        // Just trigger action, DO NOT pop back stack here
                        if (isEditing) {
                            viewModel.updateProductDetails(productId, name, description, p, s)
                        } else {
                            viewModel.createProduct(name, description, p, s)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = operationState !is SellerViewModel.ProductOperationState.Loading
                ) {
                    if (operationState is SellerViewModel.ProductOperationState.Loading) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                    } else {
                        Text(if (isEditing) "更新商品" else "建立商品")
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                Text("注意: 此版本暫不支援圖片上傳。", style = MaterialTheme.typography.bodySmall)
            }
            
            if (operationState is SellerViewModel.ProductOperationState.Loading) {
                 // Overlay blocker? Optional.
            }
        }
    }
}
