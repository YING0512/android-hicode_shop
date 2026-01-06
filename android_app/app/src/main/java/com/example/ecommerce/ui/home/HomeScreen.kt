package com.example.ecommerce.ui.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingCart
import com.example.ecommerce.data.SessionManager
import com.example.ecommerce.data.model.Product
import com.example.ecommerce.viewmodel.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController, viewModel: ProductViewModel = viewModel()) {
    val products by viewModel.products.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = androidx.compose.foundation.shape.RoundedCornerShape(8.dp),
                            color = androidx.compose.ui.graphics.Color(0xFF2196F3), // Blue background for icon
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("</>", color = Color.White, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold, fontSize = 14.sp)
                            }
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Hey! Code", fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                    }
                },
                actions = {
                    IconButton(onClick = { navController.navigate(com.example.ecommerce.ui.navigation.Screen.SellerDashboard.route) }) {
                        Icon(Icons.Default.Settings, contentDescription = "賣家中心")
                    }
                    IconButton(onClick = {
                        SessionManager.clearUser()
                        navController.navigate("login") {
                            popUpTo("home") { inclusive = true }
                        }
                    }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "登出")
                    }
                }
            )
        },
        bottomBar = {
            BottomAppBar {
                NavigationBarItem(
                    selected = true,
                    onClick = { /* Stay on Home */ },
                    icon = { Text("🏠") },
                    label = { Text("首頁") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navController.navigate("cart") },
                    icon = { Icon(Icons.Default.ShoppingCart, contentDescription = "購物車") },
                    label = { Text("購物車") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navController.navigate("chat") },
                    icon = { Text("💬") },
                    label = { Text("聊天") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navController.navigate("wallet") },
                    icon = { Text("💰") },
                    label = { Text("錢包") }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navController.navigate("orders") },
                    icon = { Text("📦") },
                    label = { Text("訂單") }
                )
            }
        }
    ) { padding ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(modifier = Modifier.padding(padding)) {
                items(products) { product ->
                    ProductItem(product = product, onClick = {
                        navController.navigate(com.example.ecommerce.ui.navigation.Screen.ProductDetail.createRoute(product.productId))
                    })
                }
            }
        }
    }
}

@Composable
fun ProductItem(product: Product, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(modifier = Modifier.padding(8.dp)) {
            AsyncImage(
                model = if (product.imageUrl != null) "http://10.0.2.2/android/${product.imageUrl}" else "https://via.placeholder.com/150",
                contentDescription = product.name,
                modifier = Modifier.size(80.dp),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(text = product.name, style = MaterialTheme.typography.titleMedium)
                Text(text = "$${product.price}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                Text(text = product.description, maxLines = 2, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
