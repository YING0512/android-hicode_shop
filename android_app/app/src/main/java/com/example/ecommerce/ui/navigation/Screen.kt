package com.example.ecommerce.ui.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object Cart : Screen("cart")
    object Chat : Screen("chat")
    object Wallet : Screen("wallet")
    object ProductDetail : Screen("product/{productId}") {
        fun createRoute(productId: Int) = "product/$productId"
    }
    object ChatDetail : Screen("chat/{chatRoomId}") {
        fun createRoute(chatRoomId: Int) = "chat/$chatRoomId"
    }
    object Orders : Screen("orders")
    object SellerDashboard : Screen("seller_dashboard")
    object SellerProductForm : Screen("seller_product_form/{productId}") {
        fun createRoute(productId: Int = 0) = "seller_product_form/$productId"
    }
    object AdminCodes : Screen("admin_codes")
}
