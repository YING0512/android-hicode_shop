package com.example.ecommerce.ui.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.ecommerce.data.SessionManager
import com.example.ecommerce.data.model.ChatMessage
import com.example.ecommerce.viewmodel.ChatDetailUiState
import com.example.ecommerce.viewmodel.ChatViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatDetailScreen(navController: NavController, chatRoomId: Int, viewModel: ChatViewModel = viewModel()) {
    val uiState by viewModel.detailUiState.collectAsState()
    var messageText by remember { mutableStateOf("") }
    val currentUserId = SessionManager.getUserId()

    LaunchedEffect(chatRoomId) {
        viewModel.loadMessages(chatRoomId)
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("聊天室 #${chatRoomId}") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        bottomBar = {
            Row(
                modifier = Modifier.fillMaxWidth().padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = messageText,
                    onValueChange = { messageText = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("輸入訊息...") }
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = {
                        if (messageText.isNotBlank()) {
                            viewModel.sendMessage(chatRoomId, messageText)
                            messageText = ""
                        }
                    },
                    enabled = messageText.isNotBlank()
                ) {
                    Text("發送")
                }
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val state = uiState) {
                is ChatDetailUiState.Loading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                is ChatDetailUiState.Error -> Text("Error: ${state.message}", modifier = Modifier.align(Alignment.Center))
                is ChatDetailUiState.Success -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize().padding(horizontal = 8.dp),
                        reverseLayout = false // Messages are likely sorted ASC (oldest top), so standard list
                    ) {
                        items(state.messages) { msg ->
                            val isMe = msg.sender_id == currentUserId
                            val isSystem = msg.message_type == "SYSTEM"
                            
                            if (isSystem) {
                                SystemMessageBubble(msg)
                            } else {
                                MessageBubble(msg, isMe)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MessageBubble(msg: ChatMessage, isMe: Boolean) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isMe) Alignment.End else Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .padding(4.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(if (isMe) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.secondaryContainer)
                .padding(8.dp)
        ) {
            Text(text = msg.content)
        }
    }
}

@Composable
fun SystemMessageBubble(msg: ChatMessage) {
    Box(modifier = Modifier.fillMaxWidth().padding(4.dp), contentAlignment = Alignment.Center) {
        Text(text = msg.content, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
    }
}
