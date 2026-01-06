package com.example.ecommerce.data.model

import com.google.gson.annotations.SerializedName

data class Product(
    @SerializedName("product_id") val productId: Int,
    @SerializedName("seller_id") val sellerId: Int,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String,
    @SerializedName("price") val price: Double,
    @SerializedName("stock_quantity") val stockQuantity: Int,
    @SerializedName("category_id") val categoryId: Int?,
    @SerializedName("image_url") val imageUrl: String?,
    @SerializedName("status") val status: String, // 'on_shelf', 'off_shelf'
    @SerializedName("seller_name") val sellerName: String? = null // Optional, from JOIN
)

data class ProductUpdateRequest(
    @SerializedName("product_id") val productId: Int,
    @SerializedName("seller_id") val sellerId: Int,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String,
    @SerializedName("price") val price: Double,
    @SerializedName("stock_quantity") val stockQuantity: Int,
    @SerializedName("status") val status: String? = null,
    @SerializedName("category_id") val categoryId: Int? = null
)
