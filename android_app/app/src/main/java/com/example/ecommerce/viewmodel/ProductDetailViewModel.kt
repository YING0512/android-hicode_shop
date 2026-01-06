package com.example.ecommerce.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ecommerce.data.model.AddToCartRequest
import com.example.ecommerce.data.model.Product
import com.example.ecommerce.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

sealed class ProductDetailUiState {
    object Loading : ProductDetailUiState()
    data class Success(val product: Product) : ProductDetailUiState()
    data class Error(val message: String) : ProductDetailUiState()
}

class ProductDetailViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<ProductDetailUiState>(ProductDetailUiState.Loading)
    val uiState: StateFlow<ProductDetailUiState> = _uiState

    fun loadProduct(productId: Int) {
        viewModelScope.launch {
            _uiState.value = ProductDetailUiState.Loading
            try {
                val response = RetrofitClient.instance.getProduct(productId)
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = ProductDetailUiState.Success(response.body()!!)
                } else {
                    _uiState.value = ProductDetailUiState.Error("Failed to load product")
                }
            } catch (e: Exception) {
                _uiState.value = ProductDetailUiState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun addToCart(userId: Int, productId: Int, quantity: Int, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            try {
                val request = AddToCartRequest(userId, productId, quantity)
                val response = RetrofitClient.instance.addToCart(request)
                // addToCart now returns AddToCartResponse directly or throws error
                onResult(true, "Added directly")
            } catch (e: Exception) {
                // If ApiService.addToCart returns objects directly, 4xx/5xx throw HttpException
                onResult(false, e.message ?: "Failed to add to cart")
            }
        }
    }
}
