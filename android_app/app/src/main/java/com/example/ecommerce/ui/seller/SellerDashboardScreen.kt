package com.example.ecommerce.ui.seller

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import com.example.ecommerce.data.model.Order
import com.example.ecommerce.data.model.Product
import com.example.ecommerce.ui.navigation.Screen
import com.example.ecommerce.viewmodel.SellerOrdersUiState
import com.example.ecommerce.viewmodel.SellerProductsUiState
import com.example.ecommerce.viewmodel.SellerViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerDashboardScreen(navController: NavController, viewModel: SellerViewModel = viewModel()) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("商品管理", "訂單管理")
    val snackbarHostState = remember { SnackbarHostState() }
    val opMsg by viewModel.operationMessage.collectAsState()
    
    // Security Check
    val user by com.example.ecommerce.data.SessionManager.currentUser.collectAsState()
    LaunchedEffect(user) {
         val role = user?.role
         if (role != "seller" && role != "admin") {
             navController.popBackStack()
         }
    }

    LaunchedEffect(opMsg) {
        opMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessage()
        }
    }

    LaunchedEffect(selectedTab) {
        if (selectedTab == 0) viewModel.loadMyProducts()
        else viewModel.loadMyOrders()
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("賣家中心") }) },
        floatingActionButton = {
            if (selectedTab == 0) {
                FloatingActionButton(onClick = { navController.navigate(Screen.SellerProductForm.createRoute(0)) }) {
                    Icon(Icons.Default.Add, contentDescription = "新增商品")
                }
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }

            Box(modifier = Modifier.fillMaxSize()) {
                if (selectedTab == 0) {
                    SellerProductsView(navController, viewModel)
                } else {
                    SellerOrdersView(viewModel)
                }
            }
        }
    }
}

@Composable
fun SellerProductsView(navController: NavController, viewModel: SellerViewModel) {
    val uiState by viewModel.productsUiState.collectAsState()

    when (val state = uiState) {
        is SellerProductsUiState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        is SellerProductsUiState.Error -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("錯誤: ${state.message}") }
        is SellerProductsUiState.Success -> {
            LazyVerticalGrid(columns = GridCells.Fixed(2), contentPadding = PaddingValues(8.dp)) {
                items(state.products) { product ->
                    SellerProductItem(product,
                        onEdit = { navController.navigate(Screen.SellerProductForm.createRoute(product.productId)) },
                        onDelete = { viewModel.deleteProduct(product.productId) },
                        onToggle = { viewModel.toggleProductStatus(product) }
                    )
                }
            }
        }
    }
}

@Composable
fun SellerProductItem(product: Product, onEdit: () -> Unit, onDelete: () -> Unit, onToggle: () -> Unit) {
    Card(modifier = Modifier.padding(8.dp).fillMaxWidth()) {
        Column {
            Image(
                painter = rememberAsyncImagePainter(product.imageUrl ?: "https://via.placeholder.com/150"),
                contentDescription = product.name,
                modifier = Modifier.height(120.dp).fillMaxWidth(),
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(8.dp)) {
                Text(product.name, style = MaterialTheme.typography.titleMedium, maxLines = 1)
                Text("$${String.format("%.2f", product.price)}", style = MaterialTheme.typography.bodyMedium)
                Text("庫存: ${product.stockQuantity}", style = MaterialTheme.typography.bodySmall)
                Text(
                    if (product.status == "on_shelf") "上架中" else "已下架",
                    color = if (product.status == "on_shelf") Color.Green else Color.Red,
                    style = MaterialTheme.typography.bodySmall
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    TextButton(onClick = onEdit) { Text("編輯") }
                    TextButton(onClick = onToggle) { Text(if (product.status == "on_shelf") "下架" else "上架") }
                }
                TextButton(onClick = onDelete, colors = ButtonDefaults.textButtonColors(contentColor = Color.Red)) {
                    Text("刪除")
                }
            }
        }
    }
}

@Composable
fun SellerOrdersView(viewModel: SellerViewModel) {
    val uiState by viewModel.ordersUiState.collectAsState()

    when (val state = uiState) {
        is SellerOrdersUiState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        is SellerOrdersUiState.Error -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("錯誤: ${state.message}") }
        is SellerOrdersUiState.Success -> {
            LazyColumn(contentPadding = PaddingValues(16.dp)) {
                items(state.orders) { order ->
                    SellerOrderItem(order, 
                        onCancel = { viewModel.updateOrder(order.order_id, "cancel") },
                        onComplete = { viewModel.updateOrder(order.order_id, "complete") }
                    )
                }
            }
        }
    }
}

@Composable
fun SellerOrderItem(order: Order, onCancel: () -> Unit, onComplete: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text("訂單編號 #${order.order_id}", style = MaterialTheme.typography.titleMedium)
                Text(order.status, color = when(order.status) {
                    "COMPLETED" -> Color.Green
                    "CANCELLED" -> Color.Red
                    else -> Color.Blue // Pending
                })
            }
            Text("總計: $${order.total_amount}")
            Text("日期: ${order.order_date}")
            
            if (order.status == "PENDING") {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    OutlinedButton(onClick = onCancel, modifier = Modifier.padding(end = 8.dp)) { Text("取消訂單") }
                    Button(onClick = onComplete) { Text("完成訂單") }
                }
            }
        }
    }
}
