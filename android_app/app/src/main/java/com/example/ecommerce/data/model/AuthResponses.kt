package com.example.ecommerce.data.model

import com.google.gson.annotations.SerializedName

data class LoginResponse(
    @SerializedName("message") val message: String?,
    @SerializedName("error") val error: String?,
    @SerializedName("user") val user: User?
)

data class RegisterResponse(
    @SerializedName("message") val message: String?,
    @SerializedName("error") val error: String?,
    @SerializedName("user_id") val userId: Int?
)

data class GeneralResponse(
    @SerializedName("message") val message: String?,
    @SerializedName("error") val error: String?
)
