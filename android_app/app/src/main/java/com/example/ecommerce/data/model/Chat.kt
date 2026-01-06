package com.example.ecommerce.data.model

data class ChatRoom(
    val chat_room_id: Int,
    val buyer_id: Int,
    val seller_id: Int,
    val buyer_name: String,
    val seller_name: String,
    val last_message: String?,
    val last_message_time: String?,
    val unread_count: Int
)

data class ChatMessage(
    val message_id: Int,
    val chat_room_id: Int,
    val sender_id: Int?,
    val message_type: String, // TEXT, IMAGE, SYSTEM
    val content: String,
    val created_at: String,
    val is_read: Int,
    val sender_name: String?
)

data class SendMessageRequest(
    val room_id: Int,
    val sender_id: Int,
    val content: String,
    val type: String = "TEXT"
)

data class SendMessageResponse(
    val status: String,
    val message_id: Int
)
