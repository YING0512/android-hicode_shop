package com.example.ecommerce.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ecommerce.data.SessionManager
import com.example.ecommerce.data.model.CreateCodeRequest
import com.example.ecommerce.data.model.RedemptionCode
import com.example.ecommerce.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AdminViewModel : ViewModel() {
    private val _codes = MutableStateFlow<List<RedemptionCode>>(emptyList())
    val codes: StateFlow<List<RedemptionCode>> = _codes

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage

    fun loadCodes() {
        val adminId = SessionManager.getUserId()
        viewModelScope.launch {
            try {
                val response = RetrofitClient.instance.getCodes(adminId)
                _codes.value = response
            } catch (e: Exception) {
                _errorMessage.value = e.message
            }
        }
    }

    fun createCode(code: String, value: Double, maxUses: Int) {
        val adminId = SessionManager.getUserId()
        viewModelScope.launch {
            try {
                val request = CreateCodeRequest(adminId, code, value, maxUses)
                val response = RetrofitClient.instance.createCode(request)
                if (response.isSuccessful) {
                    loadCodes()
                } else {
                    _errorMessage.value = "Failed to create code"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message
            }
        }
    }

    fun deleteCode(codeId: Int) {
        val adminId = SessionManager.getUserId()
        viewModelScope.launch {
            try {
                val response = RetrofitClient.instance.deleteCode(adminId, codeId)
                if (response.isSuccessful) {
                    loadCodes()
                } else {
                    _errorMessage.value = "Failed to delete code"
                }
            } catch (e: Exception) {
                _errorMessage.value = e.message
            }
        }
    }
}
