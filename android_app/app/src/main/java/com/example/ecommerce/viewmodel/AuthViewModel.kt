package com.example.ecommerce.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ecommerce.data.SessionManager
import com.example.ecommerce.data.model.*
import com.example.ecommerce.data.remote.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user

    private val _loginState = MutableStateFlow<AuthResult>(AuthResult.Idle)
    val loginState: StateFlow<AuthResult> = _loginState
    private val _authResult = MutableStateFlow<AuthResult>(AuthResult.Idle) // Renamed _loginState to _authResult
    val authResult: StateFlow<AuthResult> = _authResult // Renamed loginState to authResult

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authResult.value = AuthResult.Loading
            try {
                // Use the map version of login call
                val response = RetrofitClient.instance.login(request = mapOf("email" to email, "password" to password))
                if (response.isSuccessful && response.body() != null) {
                    val result = response.body()!!
                    // LoginRescponse: message, error, user
                    if (result.user != null) {
                        SessionManager.saveUser(result.user)
                        _user.value = result.user
                        _authResult.value = AuthResult.Success(result.user)
                    } else {
                        _authResult.value = AuthResult.Error(result.error ?: result.message ?: "Login failed")
                    }
                } else {
                    _authResult.value = AuthResult.Error(response.message() ?: "Login failed")
                }
            } catch (e: Exception) {
                _authResult.value = AuthResult.Error(e.message ?: "Network error")
            }
        }
    }

    fun register(username: String, email: String, password: String) {
         viewModelScope.launch {
            _authResult.value = AuthResult.Loading
            try {
                val response = RetrofitClient.instance.register(request = mapOf("username" to username, "email" to email, "password" to password))
                // Note: RegisterResponse might strictly return { "status": "success", "user_id": 123 } or similar.
                // Assuming RegisterResponse handles this locally or we parse generic map.
                // Let's assume RegisterResponse has userId/message
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    if (body.userId != null) {
                         // Auto login or prompt success?
                         // For now, allow UI to navigate. 
                         // We might not get full User object here, so just Success with dummy or null?
                         // Ideally we should auto-login.
                         login(email, password)
                    } else {
                        _authResult.value = AuthResult.Error(body.error ?: "Registration failed")
                    }
                } else {
                    _authResult.value = AuthResult.Error(response.message() ?: "Registration failed")
                }
            } catch (e: Exception) {
                _authResult.value = AuthResult.Error(e.message ?: "Network error")
            }
        }
    }
}

sealed class AuthResult {
    object Idle : AuthResult()
    object Loading : AuthResult()
    data class Success(val user: User) : AuthResult()
    data class Error(val message: String) : AuthResult()
}
