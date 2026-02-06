# Android HiCode Shop (電商購物平台)

這是一個完整的全端電商購物專案，包含原生地 Android 應用程式 (Kotlin/Compose) 以及 PHP 後端 API 和管理介面。

## 📋 專案概述

Android HiCode Shop 致力於提供一個現代化、功能豐富的購物體驗。專案整合了使用者端 (Android App) 與 商家/管理員後台 (Web)，支援完整的購物流程、訂單管理、即時聊天以及錢包儲值功能。

## ✨ 主要功能

### 📱 Android App (使用者端)
- **商品瀏覽**: 查看商品列表、詳情、圖片展示。
- **購物車**: 加入商品、調整數量、結帳。
- **訂單管理**: 查看訂單狀態 (待處理、運送中、已完成)、取消訂單。
- **電子錢包**: 儲值碼兌換、餘額查詢、使用餘額付款。
- **即時聊天**: 與賣家進行即時訊息溝通 (支援文字與圖片)。
- **使用者中心**: 登入/註冊、個人資料管理。

### 💻 Web 後台 (賣家與管理員)
- **賣家儀表板**: 
  - 商品管理 (新增/編輯/刪除)。
  - 訂單處理 (更新訂單狀態)。
  - 聊天管理 (回覆買家訊息)。
- **管理員面板**:
  - 使用者管理 (角色分配)。
  - 儲值碼生成 (用於錢包儲值)。
  - 系統監控。

## 🛠️ 技術架構

### Android App
- **語言**: Kotlin
- **UI 框架**: Jetpack Compose (Material Design 3)
- **網路請求**: Retrofit + OkHttp
- **圖片加載**: Coil
- **導航**: Navigation Compose

### Backend (後端)
- **語言**: PHP (Native)
- **資料庫**: MySQL (InnoDB Engine)
- **API 架構**: RESTful 風格 JSON API
- **主要模組**: `auth.php` (驗證), `products.php` (商品), `orders.php` (訂單), `chat.php` (聊天), `wallet.php` (錢包)

### Frontend (Web)
- **技術**: HTML5, CSS3, JavaScript (原生)
- **頁面**: 包含登入、註冊、後台管理等靜態頁面，透過 AJAX 與後端互動。

## 🚀 安裝與執行指南

### 1. 資料庫設定
1. 確保已安裝 MySQL。
2. 建立資料庫 `ecommerce_db`。
3. 匯入 `database/schema.sql` 檔案以建立所需的資料表結構。

### 2. 後端設定
1. 將 `backend` 與 `frontend_html` 資料夾部署至 PHP 伺服器 (如 XAMPP/WAMP 的 `htdocs` 目錄)。
2. 檢查 `backend/db.php`，確保資料庫連線資訊 (主機、帳號、密碼) 正確。
3. 確保伺服器已啟動。

### 3. Android App 設定
1. 使用 Android Studio 開啟 `android_app` 資料夾。
2. 開啟 `app/build.gradle.kts` 確認 SDK 版本相容性。
3. 修改 API 基礎網址 (Base URL) 指向你的本機或遠端伺服器 IP 地址 (避免使用 localhost，Android 模擬器請用 `10.0.2.2`)。
4. Sync Gradle 並執行 App 於模擬器或實體裝置上。

## 📂 專案結構

- `android_app/`: Android 應用程式原始碼。
- `backend/`: PHP 後端 API 程式碼。
- `database/`: 資料庫結構 SQL 檔案。
- `frontend_html/`: Web 版後台管理介面。
