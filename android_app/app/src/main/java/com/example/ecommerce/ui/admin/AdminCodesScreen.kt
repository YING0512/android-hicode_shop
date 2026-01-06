package com.example.ecommerce.ui.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.ecommerce.data.model.RedemptionCode
import com.example.ecommerce.viewmodel.AdminViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminCodesScreen(navController: NavController, viewModel: AdminViewModel = viewModel()) {
    val codes by viewModel.codes.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    var showDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.loadCodes()
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("代碼管理 (Admin)") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "新增代碼")
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (errorMessage != null) {
                Text("Error: $errorMessage", color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(8.dp))
            }

            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(codes) { code ->
                    CodeItem(code, onDelete = { viewModel.deleteCode(code.codeId) })
                }
            }
        }
    }

    if (showDialog) {
        CreateCodeDialog(
            onDismiss = { showDialog = false },
            onConfirm = { code, value, max ->
                viewModel.createCode(code, value, max)
                showDialog = false
            }
        )
    }
}

@Composable
fun CodeItem(code: RedemptionCode, onDelete: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = code.code, style = MaterialTheme.typography.titleMedium)
                Text(text = "面額: $${code.value}", style = MaterialTheme.typography.bodyMedium)
                Text(text = "使用: ${code.currentUses}/${code.maxUses}", style = MaterialTheme.typography.bodySmall)
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = "刪除", tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}

@Composable
fun CreateCodeDialog(onDismiss: () -> Unit, onConfirm: (String, Double, Int) -> Unit) {
    var code by remember { mutableStateOf("") }
    var value by remember { mutableStateOf("100") }
    var maxUses by remember { mutableStateOf("1") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("新增兌換代碼") },
        text = {
            Column {
                OutlinedTextField(value = code, onValueChange = { code = it }, label = { Text("代碼 (Code)") })
                OutlinedTextField(value = value, onValueChange = { value = it }, label = { Text("面額 (Value)") })
                OutlinedTextField(value = maxUses, onValueChange = { maxUses = it }, label = { Text("次數 (Max Uses)") })
            }
        },
        confirmButton = {
            Button(onClick = {
                onConfirm(code, value.toDoubleOrNull() ?: 100.0, maxUses.toIntOrNull() ?: 1)
            }) { Text("建立") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("取消") }
        }
    )
}
