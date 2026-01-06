package com.example.ecommerce.ui.chat

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.ecommerce.data.model.ChatRoom
import com.example.ecommerce.ui.navigation.Screen
import com.example.ecommerce.viewmodel.ChatListUiState
import com.example.ecommerce.viewmodel.ChatViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(navController: NavController, viewModel: ChatViewModel = viewModel()) {
    val uiState by viewModel.listUiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadChatRooms()
    }

    val isLoading = uiState is ChatListUiState.Loading
    val error = (uiState as? ChatListUiState.Error)?.message
    val chatRooms = (uiState as? ChatListUiState.Success)?.rooms ?: emptyList()

    Scaffold(
        topBar = { CenterAlignedTopAppBar(title = { Text("聊天室") }) }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            } else if (error != null) {
                Text("錯誤: $error", color = Color.Red, modifier = Modifier.align(Alignment.Center))
            } else {
                if (chatRooms.isEmpty()) {
                    Text("No conversations yet", modifier = Modifier.align(Alignment.Center))
                } else {
                    LazyColumn {
                        items(chatRooms) { room ->
                            ChatRoomItem(room = room, onClick = {
                                navController.navigate(Screen.ChatDetail.createRoute(room.chat_room_id))
                            })
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ChatRoomItem(room: ChatRoom, onClick: () -> Unit) {
    // Determine display name: if I am buyer, show seller; if I am seller, show buyer.
    // Ideally user ID comparison, but for simplicity show both or logic in VM.
    // Display: "Seller: ... | Buyer: ..." or just last message
    
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp).clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Room #${room.chat_room_id}", fontWeight = FontWeight.Bold)
            Text("With: ${room.seller_name} / ${room.buyer_name}", style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(room.last_message ?: "No messages", color = Color.Gray, maxLines = 1)
        }
    }
}
