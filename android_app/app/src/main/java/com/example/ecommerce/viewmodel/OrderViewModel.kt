package com.example.ecommerce.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ecommerce.data.SessionManager
import com.example.ecommerce.data.model.Order
import com.example.ecommerce.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class OrdersUiState {
    object Loading : OrdersUiState()
    data class Success(val orders: List<Order>) : OrdersUiState()
    data class Error(val message: String) : OrdersUiState()
}

class OrderViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<OrdersUiState>(OrdersUiState.Loading)
    val uiState: StateFlow<OrdersUiState> = _uiState

    fun loadOrders() {
        val userId = SessionManager.getUserId()
        if (userId == -1) {
            _uiState.value = OrdersUiState.Error("Please login first")
            return
        }

        viewModelScope.launch {
            _uiState.value = OrdersUiState.Loading
            try {
                val orders = RetrofitClient.instance.getOrders(userId)
                _uiState.value = OrdersUiState.Success(orders)
            } catch (e: Exception) {
                _uiState.value = OrdersUiState.Error(e.message ?: "Failed to load orders")
            }
        }
    }
}
