# Fa3Go Portfolio

> 一個雙平台響應式個人作品集網站 — Windows 11 桌面版 + iOS 手機版

**🌐 網址：** [https://fa3go.github.io/](https://fa3go.github.io/)

---

## ✨ 特色

### 🖥️ Windows 11 桌面版
- **現代化界面** — 圓角視窗、毛玻璃效果、流暢動畫
- **完整視窗管理** — 拖曳、最小化、最大化、關閉
- **工作列** — 靠左排列、動態應用圖標、系統托盤
- **開始選單** — 搜尋框、已釘選應用、使用者資料
- **Widget 面板** — 天氣、新聞、快速連結
- **可自訂桌布** — 支援 Windows 11 官方桌布或自訂圖片

### 📱 iOS 手機版
- **原生 iOS 體驗** — 狀態欄、Home 指示條、毛玻璃 Dock
- **觸控優化** — 滑動手勢、長按震動反饋
- **控制中心** — 從右上角下滑開啟
- **iOS 17 風格桌布** — 抽象色彩設計
- **App 動畫** — 開啟/關閉平滑過渡效果

### 🔄 智慧切換
- **自動偵測設備** — 手機/平板自動顯示 iOS 版，桌面顯示 Windows 11 版
- **手動切換** — 可隨時在兩個版本間切換
- **偏好記憶** — 使用 localStorage 記住使用者選擇

---

## 📂 內容展示

| 區塊 | 說明 |
|------|------|
| 🧑‍💻 **關於我** | 個人簡介與技術技能標籤 |
| 📁 **我的作品** | 專案展示與 Demo 連結 |
| 📸 **相簿** | 圖片網格瀏覽與全螢幕檢視器 |
| ✉️ **聯絡方式** | GitHub、Email 等社群連結 |
| 📝 **記事本** | 可即時編輯並自動儲存 |
| 🚀 **太空射擊** | 內建像素風格射擊遊戲 |

### 🎮 太空射擊遊戲
- 5 個關卡，各有不同敵人排列模式
- 敵人會主動發射子彈
- 3 條生命制
- **操作：** `← →` 移動，`空白鍵` 發射

---

## 🛠️ 技術棧

### 前端技術
- **HTML5 / CSS3 / JavaScript** — 核心架構
- **Canvas API** — 遊戲圖形渲染
- **CSS Backdrop Filter** — 毛玻璃效果
- **CSS Grid & Flexbox** — 響應式佈局
- **LocalStorage** — 數據持久化

### 設計風格
- **Windows 11 Fluent Design** — 桌面版設計語言
- **iOS Human Interface Guidelines** — 手機版設計規範
- **Font Awesome 6** — 圖示系統
- **Google Fonts** — Pixelify Sans 像素字體

### 部署
- **GitHub Pages** — 靜態網站託管
- **Git** — 版本控制

---

## 📁 檔案結構

```
Fa3Go.github.io/
├── index.html              # 入口頁面（設備偵測與導向）
├── desktop.html            # Windows 11 桌面版
├── desktop.css             # Windows 11 樣式
├── desktop.js              # Windows 11 交互邏輯
├── mobile.html             # iOS 手機版
├── mobile.css              # iOS 樣式
├── mobile.js               # iOS 交互邏輯
├── space-shooter.html      # 太空射擊遊戲
├── space-shooter.js        # 遊戲邏輯
├── player.js               # 玩家控制
├── images/                 # 圖片資源
│   ├── biography.png
│   ├── folder.png
│   ├── photo.png
│   ├── mail.png
│   ├── notepad.png
│   ├── win11_wallpaper.jpg
│   └── ios_wallpaper.jpg
└── README.md
```

---

## 🚀 本地開發

### 克隆專案
```bash
git clone https://github.com/Fa3Go/Fa3Go.github.io.git
cd Fa3Go.github.io
```

### 啟動本地伺服器
```bash
# 使用 Python 3
python -m http.server 8000

# 或使用 Python 2
python -m SimpleHTTPServer 8000

# 或使用 Node.js
npx http-server -p 8000
```

### 訪問網站
打開瀏覽器訪問：`http://localhost:8000`

---

## 🎨 自訂桌布

### Windows 11 桌面版
1. 下載你喜歡的桌布圖片
2. 將圖片儲存到 `images/wallpaper.jpg`
3. 編輯 `desktop.css` 第 47 行：
   ```css
   background-image: url('images/wallpaper.jpg');
   ```

### iOS 手機版
1. 下載 iOS 風格桌布
2. 將圖片儲存到 `images/ios-wallpaper.jpg`
3. 編輯 `mobile.css` 第 91 行：
   ```css
   background-image: url('images/ios-wallpaper.jpg');
   ```

---

## 📱 瀏覽器支援

| 瀏覽器 | 版本 |
|--------|------|
| Chrome | ✅ 90+ |
| Firefox | ✅ 88+ |
| Safari | ✅ 14+ |
| Edge | ✅ 90+ |
| Mobile Safari | ✅ iOS 14+ |
| Chrome Mobile | ✅ Android 8+ |

---

## 📝 待辦功能

- [ ] 深色模式切換
- [ ] 多語言支援（中/英）
- [ ] GitHub 貢獻圖表整合
- [ ] 履歷 PDF 下載
- [ ] 更多互動小遊戲
- [ ] 部落格文章系統

---

## 👨‍💻 作者

**Fa3Go**

- GitHub: [@Fa3Go](https://github.com/Fa3Go)
- Website: [https://fa3go.github.io/](https://fa3go.github.io/)

---

## 📄 授權

本專案採用 MIT 授權條款

---

## 🙏 致謝

- Windows 11 設計靈感來自 Microsoft Fluent Design
- iOS 設計靈感來自 Apple Human Interface Guidelines
- 圖標來自 Font Awesome
- 字體來自 Google Fonts

---

**⭐ 如果你喜歡這個專案，歡迎給個 Star！**
