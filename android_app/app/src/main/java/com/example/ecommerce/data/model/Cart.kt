package com.example.ecommerce.data.model

data class Cart(
    val cart_id: Int,
    val items: List<CartItem>
)

data class CartItem(
    val cart_item_id: Int,
    val product_id: Int,
    val quantity: Int,
    val name: String,
    val price: Double,
    val stock_quantity: Int
)

data class AddToCartRequest(
    val user_id: Int,
    val product_id: Int,
    val quantity: Int
)

data class AddToCartResponse(
    val message: String,
    val cart_id: Int
)
