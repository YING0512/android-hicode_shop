package com.example.ecommerce.ui.cart

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.ecommerce.viewmodel.CartUiState
import com.example.ecommerce.viewmodel.CartViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(navController: NavController, viewModel: CartViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    // Dialog state removed as requested
    val context = androidx.compose.ui.platform.LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.loadCart()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Shopping Cart") },
                actions = {
                    IconButton(onClick = { viewModel.loadCart() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        },
        bottomBar = {
            if (uiState is CartUiState.Success) {
                val state = uiState as CartUiState.Success
                BottomAppBar {
                   Row(
                       modifier = Modifier.fillMaxWidth().padding(16.dp),
                       horizontalArrangement = Arrangement.SpaceBetween,
                       verticalAlignment = Alignment.CenterVertically
                   ) {
                       Text("Total: $${state.totalPrice}", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                       // Direct Checkout Button
                       Button(onClick = { 
                           viewModel.checkout("Default Address") { success, msg ->
                               if (success) {
                                   android.widget.Toast.makeText(context, "訂單建立成功！", android.widget.Toast.LENGTH_LONG).show()
                               } else {
                                   android.widget.Toast.makeText(context, "結帳失敗: $msg", android.widget.Toast.LENGTH_LONG).show()
                               }
                           }
                       }) {
                           Text("Checkout")
                       }
                   }
                }
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val state = uiState) {
                is CartUiState.Loading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                is CartUiState.Empty -> {
                    Column(modifier = Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("購物車是空的", style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = { viewModel.loadCart() }) { Text("重新整理") }
                    }
                }
                is CartUiState.Error -> {
                    Column(modifier = Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Error: ${state.message}", color = Color.Red)
                        Button(onClick = { viewModel.loadCart() }) { Text("Retry") }
                    }
                }
                is CartUiState.Success -> {
                    if (state.cart.items.isEmpty()) {
                        Text("購物車是空的", modifier = Modifier.align(Alignment.Center))
                    } else {
                        Column(modifier = Modifier.fillMaxSize()) {
                            LazyColumn(modifier = Modifier.weight(1f)) {
                                items(state.cart.items) { item ->
                                    CartItemRow(item, onRemove = { viewModel.removeFromCart(item.cart_item_id) })
                                }
                            }
                            // Bottom summary already in BottomAppBar
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CartItemRow(item: com.example.ecommerce.data.model.CartItem, onRemove: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(item.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("單價: $${item.price}", style = MaterialTheme.typography.bodyMedium)
                Text("數量: ${item.quantity}", style = MaterialTheme.typography.bodyMedium)
                // Total for this item
                Text("小計: $${item.price * item.quantity}", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
            }
            IconButton(onClick = onRemove) {
                Icon(Icons.Default.Delete, contentDescription = "Remove")
            }
        }
    }
}
