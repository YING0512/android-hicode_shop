package com.example.ecommerce.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ecommerce.data.SessionManager
import com.example.ecommerce.data.model.RedeemRequest
import com.example.ecommerce.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class WalletUiState {
    object Loading : WalletUiState()
    data class Success(val balance: Double, val role: String) : WalletUiState()
    data class Error(val message: String) : WalletUiState()
}

class WalletViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<WalletUiState>(WalletUiState.Loading)
    val uiState: StateFlow<WalletUiState> = _uiState
    
    private val _redeemMessage = MutableStateFlow<String?>(null)
    val redeemMessage: StateFlow<String?> = _redeemMessage

    fun loadBalance() {
        val userId = SessionManager.getUserId()
        if (userId == -1) {
            _uiState.value = WalletUiState.Error("Please login first")
            return
        }

        viewModelScope.launch {
            _uiState.value = WalletUiState.Loading
            try {
                val response = RetrofitClient.instance.getWalletBalance(userId)
                _uiState.value = WalletUiState.Success(response.balance, response.role)
            } catch (e: Exception) {
                _uiState.value = WalletUiState.Error(e.message ?: "Failed to load wallet")
            }
        }
    }

    fun redeemCode(code: String) {
        val userId = SessionManager.getUserId()
        viewModelScope.launch {
            try {
                val request = RedeemRequest(userId, code)
                val response = RetrofitClient.instance.redeemCode(request)
                if (response.added_value != null) {
                    _redeemMessage.value = "Redeemed $${response.added_value}"
                    loadBalance() // Refresh
                } else {
                    _redeemMessage.value = response.message
                }
            } catch (e: Exception) {
                _redeemMessage.value = e.message ?: "Redemption failed"
            }
        }
    }
    
    fun clearMessage() {
        _redeemMessage.value = null
    }
}
