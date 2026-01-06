package com.example.ecommerce.ui.order

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.example.ecommerce.data.model.Order
import com.example.ecommerce.viewmodel.OrderViewModel
import com.example.ecommerce.viewmodel.OrdersUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(navController: NavController, viewModel: OrderViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadOrders()
    }

    Scaffold(
        topBar = { CenterAlignedTopAppBar(title = { Text("我的訂單") }) }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val state = uiState) {
                is OrdersUiState.Loading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                is OrdersUiState.Error -> Text("錯誤: ${state.message}", color = Color.Red, modifier = Modifier.align(Alignment.Center))
                is OrdersUiState.Success -> {
                    if (state.orders.isEmpty()) {
                        Text("無訂單記錄", modifier = Modifier.align(Alignment.Center))
                    } else {
                        LazyColumn(contentPadding = PaddingValues(16.dp)) {
                            items(state.orders) { order ->
                                OrderItem(order)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun OrderItem(order: Order) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text("訂單編號 #${order.order_id}", fontWeight = FontWeight.Bold)
                Text(order.status, color = if (order.status == "COMPLETED") Color.Green else Color.Gray)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text("總計: $${order.total_amount}")
            Text("日期: ${order.order_date}", style = MaterialTheme.typography.bodySmall)
            
            Spacer(modifier = Modifier.height(8.dp))
            Divider()
            Spacer(modifier = Modifier.height(8.dp))
            
            order.items.forEach { item ->
                Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
                    Text("${item.name} x${item.quantity}", modifier = Modifier.weight(1f))
                    Text("$${item.price}")
                }
            }
        }
    }
}
