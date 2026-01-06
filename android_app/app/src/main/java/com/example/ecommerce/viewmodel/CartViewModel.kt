package com.example.ecommerce.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ecommerce.data.SessionManager
import com.example.ecommerce.data.model.Cart
import com.example.ecommerce.data.model.CreateOrderRequest
import com.example.ecommerce.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class CartUiState {
    object Loading : CartUiState()
    data class Success(val cart: Cart, val totalPrice: Double) : CartUiState()
    data class Error(val message: String) : CartUiState()
    object Empty : CartUiState()
}

class CartViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<CartUiState>(CartUiState.Loading)
    val uiState: StateFlow<CartUiState> = _uiState

    fun loadCart() {
        val userId = SessionManager.getUserId()
        if (userId == -1) {
            _uiState.value = CartUiState.Error("Please login first")
            return
        }

        viewModelScope.launch {
            _uiState.value = CartUiState.Loading
            try {
                val cart = RetrofitClient.instance.getCart(userId)
                if (cart.items.isEmpty()) {
                    _uiState.value = CartUiState.Empty
                } else {
                    val total = cart.items.sumOf { it.price * it.quantity }
                    _uiState.value = CartUiState.Success(cart, total)
                }
            } catch (e: Exception) {
                // If cart is empty api might return 404 or empty json
                _uiState.value = CartUiState.Error(e.message ?: "Failed to load cart")
            }
        }
    }

    fun removeFromCart(cartItemId: Int) {
        val userId = SessionManager.getUserId()
        viewModelScope.launch {
            try {
                RetrofitClient.instance.removeFromCart(cartItemId, userId)
                loadCart() // Reload
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun checkout(shippingAddress: String, onResult: (Boolean, String) -> Unit) {
        val userId = SessionManager.getUserId()
        viewModelScope.launch {
            try {
                val request = CreateOrderRequest(userId, shippingAddress)
                val response = RetrofitClient.instance.createOrder(request)
                if (response.message.contains("success", ignoreCase = true)) {
                     onResult(true, response.message)
                     loadCart() // Should be empty now
                } else {
                    onResult(false, response.message)
                }
            } catch (e: Exception) {
                onResult(false, e.message ?: "Checkout failed")
            }
        }
    }
}
