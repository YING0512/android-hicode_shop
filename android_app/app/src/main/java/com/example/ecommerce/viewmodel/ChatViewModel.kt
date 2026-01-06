package com.example.ecommerce.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ecommerce.data.SessionManager
import com.example.ecommerce.data.model.ChatMessage
import com.example.ecommerce.data.model.ChatRoom
import com.example.ecommerce.data.model.SendMessageRequest
import com.example.ecommerce.data.remote.RetrofitClient
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class ChatListUiState {
    object Loading : ChatListUiState()
    data class Success(val rooms: List<ChatRoom>) : ChatListUiState()
    data class Error(val message: String) : ChatListUiState()
}

sealed class ChatDetailUiState {
    object Loading : ChatDetailUiState()
    data class Success(val messages: List<ChatMessage>) : ChatDetailUiState()
    data class Error(val message: String) : ChatDetailUiState()
}

class ChatViewModel : ViewModel() {
    private val _listUiState = MutableStateFlow<ChatListUiState>(ChatListUiState.Loading)
    val listUiState: StateFlow<ChatListUiState> = _listUiState

    private val _detailUiState = MutableStateFlow<ChatDetailUiState>(ChatDetailUiState.Loading)
    val detailUiState: StateFlow<ChatDetailUiState> = _detailUiState

    fun loadChatRooms() {
        val userId = SessionManager.getUserId()
        if (userId == -1) {
            _listUiState.value = ChatListUiState.Error("Please login first")
            return
        }

        viewModelScope.launch {
            _listUiState.value = ChatListUiState.Loading
            try {
                val rooms = RetrofitClient.instance.getChatRooms(userId)
                _listUiState.value = ChatListUiState.Success(rooms)
            } catch (e: Exception) {
                _listUiState.value = ChatListUiState.Error(e.message ?: "Failed to load chats")
            }
        }
    }

    fun loadMessages(roomId: Int) {
        viewModelScope.launch {
            _detailUiState.value = ChatDetailUiState.Loading
            try {
                val messages = RetrofitClient.instance.getChatMessages(roomId)
                _detailUiState.value = ChatDetailUiState.Success(messages)
            } catch (e: Exception) {
                _detailUiState.value = ChatDetailUiState.Error(e.message ?: "Failed to load messages")
            }
        }
    }

    fun sendMessage(roomId: Int, content: String) {
        val userId = SessionManager.getUserId()
        viewModelScope.launch {
            try {
                val request = SendMessageRequest(roomId, userId, content)
                RetrofitClient.instance.sendMessage(request)
                loadMessages(roomId) // Reload to show new message
            } catch (e: Exception) {
                // error handling
            }
        }
    }
}
