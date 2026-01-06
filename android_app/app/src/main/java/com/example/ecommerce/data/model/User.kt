package com.example.ecommerce.data.model

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("user_id") val userId: Int,
    @SerializedName("username") val username: String,
    @SerializedName("email") val email: String,
    @SerializedName("role") val role: String, // 'buyer', 'seller', 'admin'
    @SerializedName("balance") val balance: Double,
    @SerializedName("created_at") val createdAt: String
)
