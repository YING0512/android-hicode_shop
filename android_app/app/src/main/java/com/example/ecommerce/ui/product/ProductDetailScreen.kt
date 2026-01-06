package com.example.ecommerce.ui.product

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.ecommerce.data.model.Product
import com.example.ecommerce.viewmodel.ProductDetailUiState
import com.example.ecommerce.viewmodel.ProductDetailViewModel

import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    navController: NavController,
    productId: Int,
    viewModel: ProductDetailViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    // Add local state for simplified feedback if ViewModel doesn't expose it directly yet
    var addToCartState by remember { mutableStateOf(false) }

    LaunchedEffect(productId) {
        viewModel.loadProduct(productId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("商品詳情") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues).fillMaxSize()) {
            when (val state = uiState) {
                is ProductDetailUiState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is ProductDetailUiState.Error -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = state.message, color = Color.Red)
                        Button(onClick = { viewModel.loadProduct(productId) }) {
                            Text("重試")
                        }
                    }
                }
                is ProductDetailUiState.Success -> {
                    ProductContent(
                        product = state.product,
                        addToCartState = addToCartState,
                        onAddToCart = { qty ->
                            val userId = com.example.ecommerce.data.SessionManager.getUserId()
                            if (userId != -1) {
                                viewModel.addToCart(userId, productId, qty) { success, msg ->
                                    if (success) {
                                        addToCartState = true
                                    }
                                }
                            } else {
                                navController.navigate("login")
                            }
                        },
                        onResetState = { addToCartState = false }
                    )
                }
            }
        }
    }
}

@Composable
fun ProductContent(
    product: Product, 
    addToCartState: Boolean, 
    onAddToCart: (Int) -> Unit,
    onResetState: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        AsyncImage(
            model = if (product.imageUrl.isNullOrEmpty()) "https://via.placeholder.com/300" else "http://10.0.2.2/android/${product.imageUrl}",
            contentDescription = product.name,
            modifier = Modifier
                .fillMaxWidth()
                .height(250.dp),
            contentScale = ContentScale.Crop
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(text = product.name, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text(text = "$${product.price}", fontSize = 20.sp, color = MaterialTheme.colorScheme.primary)
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text("庫存: ${product.stockQuantity}", style = MaterialTheme.typography.bodyMedium)
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(product.description, style = MaterialTheme.typography.bodyMedium)

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { onAddToCart(1) },
            modifier = Modifier.fillMaxWidth(),
            enabled = product.stockQuantity > 0
        ) {
            Text("加入購物車")
        }
        
        if (addToCartState) {
            Text("加入成功！", color = Color.Green, modifier = Modifier.padding(top = 8.dp))
            LaunchedEffect(Unit) {
                delay(2000)
                onResetState()
            }
        }
    }
}
