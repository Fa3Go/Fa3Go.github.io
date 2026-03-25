# Windows 95 風格作品集

一個以 Windows 95 為主題的互動式作品集網站，完整還原經典的復古桌面體驗。

## 🎨 特色功能

### 桌面系統
- **Windows 95 復古介面** - 完整模擬經典的 Windows 95 桌面環境
- **可拖曳視窗** - 所有視窗都可以自由拖曳移動
- **視窗控制** - 支援最小化、最大化、關閉功能
- **四角調整大小** - 可從視窗四個角落拖曳調整大小
- **桌面圖示** - 單擊選取、雙擊開啟
- **開始選單** - 經典的開始選單設計
- **工作列** - 即時顯示已開啟的視窗
- **系統時鐘** - 12 小時制即時時鐘顯示

### 內容區塊
- **關於我** - 個人簡介與技術專長（使用彩色標籤展示技能）
- **我的作品** - 專案展示區
- **相簿** - 圖片展示與檢視器
- **聯絡方式** - 社群媒體與聯絡資訊
- **記事本** - 可編輯的記事本應用
- **太空射擊遊戲** - 內建復古像素風格射擊遊戲

### 遊戲功能
- **5 個關卡** - 不同難度與敵人排列模式
  - 關卡 1: 標準排列
  - 關卡 2: 金字塔形狀
  - 關卡 3: 棋盤交錯
  - 關卡 4: 鑽石形狀
  - 關卡 5: 雙牆模式
- **敵人攻擊系統** - 敵人會發射子彈攻擊玩家
- **生命值系統** - 3 條生命，被擊中會扣除
- **像素風格圖形** - 復古的 8-bit 像素藝術
- **關卡進度** - 通關後自動進入下一關

## 🛠️ 技術棧

- **HTML5** - 結構與語義化標籤
- **CSS3** - Windows 95 風格設計與動畫
- **JavaScript** - 視窗管理、遊戲邏輯、互動功能
- **Canvas API** - 遊戲圖形渲染
- **Google Fonts** - Pixelify Sans 像素字體
- **Font Awesome** - 圖示系統

## 📁 檔案結構

```
Fa3Go.github.io/
├── index.html           # 主頁面（Windows 95 介面）
├── space-shooter.html   # 太空射擊遊戲頁面
├── space-shooter.js     # 遊戲邏輯
├── README.md            # 專案說明文件
└── .github/
    ├── biography.png    # 關於我圖示
    ├── folder.png       # 作品資料夾圖示
    ├── mail.png         # 聯絡方式圖示
    ├── photo.png        # 相簿圖示
    └── notepad.png      # 記事本圖示
```

## 🎮 遊戲操作

- **← →** - 左右移動飛船
- **空白鍵** - 發射子彈
- **目標** - 消滅所有敵人進入下一關

## 🎯 設計特點

### 視覺風格
- 完整的 Windows 95 配色方案（#c0c0c0 灰色主題）
- 3D 浮雕邊框效果
- 像素字體（Pixelify Sans）
- 復古桌面圖示設計

### 互動體驗
- 真實的 OS 操作體驗
- 流暢的視窗拖曳與調整
- 響應式的按鈕點擊效果
- 完整的鍵盤與滑鼠支援

### 技能標籤
使用業界標準品牌顏色的技能標籤：
- Python、JavaScript、HTML/CSS
- Vue.js、React Native、Flutter
- MySQL、MongoDB、SQLite
- Git、Docker、Flask、Figma

## 🚀 部署

此專案使用 GitHub Pages 部署：

```bash
# 訪問網站
https://fa3go.github.io/
```

## 💡 靈感來源

靈感來自經典的 Windows 95 操作系統，以及復古遊戲如 Space Invaders 的像素藝術風格。

## 📝 開發筆記

- 所有視窗使用 flexbox 佈局確保內容正確縮放
- 使用 z-index 管理視窗層級
- Canvas 渲染使用 `image-rendering: pixelated` 保持像素風格
- 敵人射擊使用計時器控制頻率
- 關卡系統使用配置陣列動態生成不同模式

## 🔧 本地開發

```bash
# 克隆專案
git clone https://github.com/Fa3Go/Fa3Go.github.io.git

# 進入目錄
cd Fa3Go.github.io

# 使用任何 HTTP 伺服器運行
# 例如使用 Python
python -m http.server 8000

# 或使用 VS Code Live Server 擴充
```

## 📄 授權

此專案僅供個人作品集展示使用。

## 👤 作者

**Fa3Go**
- GitHub: [@Fa3Go](https://github.com/Fa3Go)

---

⭐ 如果你喜歡這個專案，歡迎給個星星！
