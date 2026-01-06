package com.example.ecommerce.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ecommerce.data.SessionManager
import com.example.ecommerce.data.model.Order
import com.example.ecommerce.data.model.Product
import com.example.ecommerce.data.model.ProductUpdateRequest
import com.example.ecommerce.data.model.OrderUpdateRequest
import com.example.ecommerce.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

sealed class SellerProductsUiState {
    object Loading : SellerProductsUiState()
    data class Success(val products: List<Product>) : SellerProductsUiState()
    data class Error(val message: String) : SellerProductsUiState()
}

sealed class SellerOrdersUiState {
    object Loading : SellerOrdersUiState()
    data class Success(val orders: List<Order>) : SellerOrdersUiState()
    data class Error(val message: String) : SellerOrdersUiState()
}

class SellerViewModel : ViewModel() {

    sealed class ProductOperationState {
        object Idle : ProductOperationState()
        object Loading : ProductOperationState()
        object Success : ProductOperationState()
        data class Error(val message: String) : ProductOperationState()
    }

    private val _productsUiState = MutableStateFlow<SellerProductsUiState>(SellerProductsUiState.Loading)
    val productsUiState: StateFlow<SellerProductsUiState> = _productsUiState

    private val _ordersUiState = MutableStateFlow<SellerOrdersUiState>(SellerOrdersUiState.Loading)
    val ordersUiState: StateFlow<SellerOrdersUiState> = _ordersUiState

    private val _operationMessage = MutableStateFlow<String?>(null)
    val operationMessage: StateFlow<String?> = _operationMessage

    private val _productOperationState = MutableStateFlow<ProductOperationState>(ProductOperationState.Idle)
    val productOperationState: StateFlow<ProductOperationState> = _productOperationState

    private val _editProductState = MutableStateFlow<Product?>(null)
    val editProductState: StateFlow<Product?> = _editProductState

    fun resetProductOperationState() {
        _productOperationState.value = ProductOperationState.Idle
    }

    fun clearMessage() {
        _operationMessage.value = null
    }

    fun clearEditProduct() {
        _editProductState.value = null
    }

    fun loadMyProducts() {
        val userId = SessionManager.getUserId()
        if (userId == -1) return
        
        viewModelScope.launch {
            _productsUiState.value = SellerProductsUiState.Loading
            try {
                val response = RetrofitClient.instance.getMyProducts(userId)
                if (response.isSuccessful && response.body() != null) {
                    _productsUiState.value = SellerProductsUiState.Success(response.body()!!)
                } else {
                    _productsUiState.value = SellerProductsUiState.Error("Failed to fetch products")
                }
            } catch (e: Exception) {
                _productsUiState.value = SellerProductsUiState.Error(e.message ?: "Network error")
            }
        }
    }

    fun loadMyOrders() {
        val userId = SessionManager.getUserId()
        if (userId == -1) return

        viewModelScope.launch {
            _ordersUiState.value = SellerOrdersUiState.Loading
            try {
                val orders = RetrofitClient.instance.getSellerOrders(userId)
                _ordersUiState.value = SellerOrdersUiState.Success(orders)
            } catch (e: Exception) {
                _ordersUiState.value = SellerOrdersUiState.Error(e.message ?: "Failed to fetch orders")
            }
        }
    }

    fun loadProductForEdit(productId: Int) {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.instance.getProduct(productId)
                if (response.isSuccessful) {
                    _editProductState.value = response.body()
                } else {
                    _operationMessage.value = "Failed to load product: ${response.code()}"
                }
            } catch (e: Exception) {
                _operationMessage.value = "Error loading product: ${e.message}"
            }
        }
    }

    fun deleteProduct(productId: Int) {
        val userId = SessionManager.getUserId()
        viewModelScope.launch {
            try {
                val response = RetrofitClient.instance.deleteProduct(productId, userId)
                if (response.isSuccessful) {
                    _operationMessage.value = "Product deleted"
                    loadMyProducts() // Refresh
                } else {
                    _operationMessage.value = "Failed to delete"
                }
            } catch (e: Exception) {
                _operationMessage.value = "Error: ${e.message}"
            }
        }
    }

    fun toggleProductStatus(product: Product) {
        val userId = SessionManager.getUserId()
        val newStatus = if (product.status == "on_shelf") "off_shelf" else "on_shelf"
        
        // Stock check
        if (newStatus == "on_shelf" && product.stockQuantity <= 0) {
            _operationMessage.value = "Cannot enable: Stock is 0"
            return
        }

        viewModelScope.launch {
            try {
                val body = ProductUpdateRequest(
                    productId = product.productId,
                    sellerId = userId,
                    name = product.name,
                    description = product.description,
                    price = product.price,
                    stockQuantity = product.stockQuantity,
                    status = newStatus,
                    categoryId = product.categoryId
                )
                val response = RetrofitClient.instance.updateProduct(body)
                if (response.isSuccessful) {
                    _operationMessage.value = "Status updated"
                    loadMyProducts()
                } else {
                     _operationMessage.value = "Update failed"
                }
            } catch (e: Exception) {
                 _operationMessage.value = "Error: ${e.message}"
            }
        }
    }

    fun updateOrder(orderId: Int, action: String, reason: String? = null) {
        val userId = SessionManager.getUserId()
        viewModelScope.launch {
            try {
                val body = OrderUpdateRequest(
                    orderId = orderId,
                    action = action,
                    userId = if (action == "cancel") userId else null,
                    reason = if (action == "cancel") (reason ?: "Seller cancelled") else null
                )

                val response = RetrofitClient.instance.updateOrder(body)
                if (response.isSuccessful) {
                    _operationMessage.value = "Order updated: $action"
                    loadMyOrders()
                } else {
                    _operationMessage.value = "Update failed: ${response.code()}"
                }
            } catch (e: Exception) {
                _operationMessage.value = "Error: ${e.message}"
            }
        }
    }

    fun createProduct(name: String, description: String, price: Double, stock: Int) {
        val userId = SessionManager.getUserId()
        viewModelScope.launch {
            _productOperationState.value = ProductOperationState.Loading
            try {
                val mediaType = "text/plain".toMediaTypeOrNull()
                val nameBody = name.toRequestBody(mediaType)
                val descBody = description.toRequestBody(mediaType)
                val priceBody = price.toString().toRequestBody(mediaType)
                val stockBody = stock.toString().toRequestBody(mediaType)
                val categoryBody = "1".toRequestBody(mediaType) // Default cat
                val sellerBody = userId.toString().toRequestBody(mediaType)
                
                val response = RetrofitClient.instance.createProduct(
                    sellerBody, nameBody, descBody, priceBody, stockBody, categoryBody, null
                )
                
                if (response.isSuccessful) {
                    _productOperationState.value = ProductOperationState.Success
                    loadMyProducts() 
                } else {
                     val errorStr = response.errorBody()?.string() ?: "Unknown error"
                     _productOperationState.value = ProductOperationState.Error("Create failed: ${response.code()} $errorStr")
                }
            } catch (e: Exception) {
                _productOperationState.value = ProductOperationState.Error("Error: ${e.message}")
            }
        }
    }

    fun updateProductDetails(productId: Int, name: String, description: String, price: Double, stock: Int) {
        val userId = SessionManager.getUserId()
        viewModelScope.launch {
            _productOperationState.value = ProductOperationState.Loading
            try {
                val body = ProductUpdateRequest(
                    productId = productId,
                    sellerId = userId,
                    name = name,
                    description = description,
                    price = price,
                    stockQuantity = stock
                )
                val response = RetrofitClient.instance.updateProduct(body)
                if (response.isSuccessful) {
                    _productOperationState.value = ProductOperationState.Success
                    loadMyProducts() 
                } else {
                    val errorStr = response.errorBody()?.string() ?: "Unknown error"
                    _productOperationState.value = ProductOperationState.Error("Update failed: ${response.code()} $errorStr")
                }
            } catch (e: Exception) {
                _productOperationState.value = ProductOperationState.Error("Error: ${e.message}")
            }
        }
    }
}
