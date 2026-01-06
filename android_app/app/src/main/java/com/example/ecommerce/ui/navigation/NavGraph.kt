package com.example.ecommerce.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.ecommerce.ui.auth.LoginScreen
import com.example.ecommerce.ui.auth.RegisterScreen
import com.example.ecommerce.ui.cart.CartScreen
import com.example.ecommerce.ui.chat.ChatScreen
import com.example.ecommerce.ui.home.HomeScreen
import com.example.ecommerce.ui.product.ProductDetailScreen
import com.example.ecommerce.ui.wallet.WalletScreen

@Composable
fun NavGraph(navController: NavHostController, modifier: Modifier = Modifier) {
    NavHost(
        navController = navController,
        startDestination = Screen.Login.route,
        modifier = modifier
    ) {
        composable(Screen.Login.route) {
            LoginScreen(navController = navController)
        }
        composable(Screen.Register.route) {
            RegisterScreen(navController = navController)
        }
        composable(Screen.Home.route) {
            HomeScreen(navController = navController)
        }
        composable(Screen.Cart.route) {
            CartScreen(navController = navController)
        }
        composable(Screen.Chat.route) {
            ChatScreen(navController = navController)
        }
        composable(Screen.Wallet.route) {
            WalletScreen(navController = navController)
        }
        composable(
            route = Screen.ProductDetail.route,
            arguments = listOf(navArgument("productId") { type = NavType.IntType })
        ) { backStackEntry ->
            val productId = backStackEntry.arguments?.getInt("productId") ?: 0
            ProductDetailScreen(navController = navController, productId = productId)
        }
        composable(
            route = Screen.ChatDetail.route,
            arguments = listOf(navArgument("chatRoomId") { type = NavType.IntType })
        ) { backStackEntry ->
            val chatRoomId = backStackEntry.arguments?.getInt("chatRoomId") ?: 0
            // We need to implement ChatDetailScreen
            com.example.ecommerce.ui.chat.ChatDetailScreen(navController = navController, chatRoomId = chatRoomId)
        }
        composable(Screen.Orders.route) {
            com.example.ecommerce.ui.order.OrdersScreen(navController = navController)
        }
        composable(Screen.SellerDashboard.route) {
            com.example.ecommerce.ui.seller.SellerDashboardScreen(navController = navController)
        }
        composable(
             route = Screen.SellerProductForm.route,
             arguments = listOf(navArgument("productId") { type = NavType.IntType })
        ) { backStackEntry ->
             val productId = backStackEntry.arguments?.getInt("productId") ?: 0
             // Implement SellerProductFormScreen
             com.example.ecommerce.ui.seller.SellerProductFormScreen(navController = navController, productId = productId)
        }
    }
}
