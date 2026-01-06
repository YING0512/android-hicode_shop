package com.example.ecommerce.data.remote

import com.example.ecommerce.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // Auth
    @POST("auth.php")
    suspend fun login(@Query("action") action: String = "login", @Body request: Map<String, String>): Response<LoginResponse>

    @POST("auth.php")
    suspend fun register(@Query("action") action: String = "register", @Body request: Map<String, String>): Response<RegisterResponse>

    // Products
    @GET("products.php")
    suspend fun getProducts(
        @Query("search") search: String? = null,
        @Query("category_id") categoryId: Int? = null
    ): Response<List<Product>>

    @GET("products.php")
    suspend fun getProduct(@Query("id") id: Int): Response<Product>

    @GET("products.php")
    suspend fun getMyProducts(@Query("seller_id") sellerId: Int): Response<List<Product>>

    @Multipart
    @POST("products.php")
    suspend fun createProduct(
        @Part("seller_id") sellerId: RequestBody,
        @Part("name") name: RequestBody,
        @Part("description") description: RequestBody,
        @Part("price") price: RequestBody,
        @Part("stock_quantity") stockQuantity: RequestBody,
        @Part("category_id") categoryId: RequestBody,
        @Part image: MultipartBody.Part?
    ): Response<GeneralResponse>

    @PUT("products.php")
    suspend fun updateProduct(@Body request: ProductUpdateRequest): Response<GeneralResponse>

    @DELETE("products.php")
    suspend fun deleteProduct(@Query("id") id: Int, @Query("seller_id") sellerId: Int): Response<GeneralResponse>

    // --- Cart ---
    @GET("cart.php")
    suspend fun getCart(@Query("user_id") userId: Int): Cart

    @POST("cart.php")
    suspend fun addToCart(@Body request: AddToCartRequest): AddToCartResponse

    @HTTP(method = "DELETE", path = "cart.php", hasBody = true)
    suspend fun removeFromCart(@Query("cart_item_id") cartItemId: Int, @Query("user_id") userId: Int): GeneralResponse

    // --- Wallet ---
    @GET("wallet.php")
    suspend fun getWalletBalance(@Query("user_id") userId: Int): WalletBalanceResponse

    @POST("wallet.php")
    suspend fun redeemCode(@Body request: RedeemRequest): RedeemResponse

    // --- Chat ---
    @GET("chat.php?action=list_rooms")
    suspend fun getChatRooms(@Query("user_id") userId: Int): List<ChatRoom>

    @GET("chat.php?action=get_messages")
    suspend fun getChatMessages(@Query("room_id") roomId: Int): List<ChatMessage>

    @POST("chat.php")
    suspend fun sendMessage(@Body request: SendMessageRequest): SendMessageResponse

    // --- Orders ---
    @GET("orders.php")
    suspend fun getOrders(@Query("user_id") userId: Int): List<Order>

    @GET("orders.php")
    suspend fun getSellerOrders(@Query("seller_id") sellerId: Int): List<Order>

    @POST("orders.php")
    suspend fun createOrder(@Body request: CreateOrderRequest): CreateOrderResponse

    @PUT("orders.php")
    suspend fun updateOrder(@Body request: OrderUpdateRequest): Response<GeneralResponse>
}
