package com.example.ecommerce.ui.wallet

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.ecommerce.viewmodel.WalletUiState
import com.example.ecommerce.viewmodel.WalletViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletScreen(navController: NavController, viewModel: WalletViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    val redeemMsg by viewModel.redeemMessage.collectAsState()
    var code by remember { mutableStateOf("") }
    
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.loadBalance()
    }

    LaunchedEffect(redeemMsg) {
        redeemMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessage()
        }
    }

    Scaffold(
        topBar = { CenterAlignedTopAppBar(title = { Text("我的錢包") }) },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val state = uiState) {
                is WalletUiState.Loading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                is WalletUiState.Error -> {
                    Text("錯誤: ${state.message}", modifier = Modifier.align(Alignment.Center), color = Color.Red)
                }
                is WalletUiState.Success -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("目前餘額", fontSize = 16.sp, color = Color.Gray)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("$${state.balance}", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        
                        Spacer(modifier = Modifier.height(48.dp))
                        
                        OutlinedTextField(
                            value = code,
                            onValueChange = { code = it },
                            label = { Text("兌換代碼") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Button(
                            onClick = { viewModel.redeemCode(code); code = "" },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = code.isNotBlank()
                        ) {
                            Text("兌換")
                        }
                    }
                }
            }
        }
    }
}
