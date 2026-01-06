package com.example.ecommerce.data.model

import com.google.gson.annotations.SerializedName

data class RedemptionCode(
    @SerializedName("code_id") val codeId: Int,
    @SerializedName("code") val code: String,
    @SerializedName("value") val value: Double,
    @SerializedName("max_uses") val maxUses: Int,
    @SerializedName("current_uses") val currentUses: Int,
    @SerializedName("created_at") val createdAt: String
)

data class CreateCodeRequest(
    @SerializedName("admin_id") val adminId: Int,
    @SerializedName("code") val code: String,
    @SerializedName("value") val value: Double,
    @SerializedName("max_uses") val maxUses: Int
)
