package com.example.ecommerce.data.model

data class WalletBalanceResponse(
    val balance: Double,
    val role: String
)

data class RedeemRequest(
    val user_id: Int,
    val code: String
)

data class RedeemResponse(
    val message: String,
    val added_value: Double?
)
