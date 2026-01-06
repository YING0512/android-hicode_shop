package com.example.ecommerce.data.model

data class Order(
    val order_id: Int,
    val user_id: Int,
    val total_amount: Double,
    val status: String, // PENDING, COMPLETED, CANCELLED
    val shipping_address: String,
    val order_date: String,
    val cancellation_reason: String?,
    val items: List<OrderItemDisplay>
)

data class OrderItemDisplay(
    val name: String,
    val price: Double,
    val quantity: Int,
    val image_url: String?
)

data class CreateOrderRequest(
    val user_id: Int,
    val shipping_address: String
)

data class CreateOrderResponse(
    val message: String,
    val order_id: Int
)

data class OrderUpdateRequest(
    @com.google.gson.annotations.SerializedName("order_id") val orderId: Int,
    @com.google.gson.annotations.SerializedName("action") val action: String, // 'cancel' or 'complete'
    @com.google.gson.annotations.SerializedName("user_id") val userId: Int? = null,
    @com.google.gson.annotations.SerializedName("reason") val reason: String? = null
)
