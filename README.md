# Fa3Go.github.io

一個以 Windows 95 為主題的互動式個人作品集網站，完整還原經典復古桌面體驗。

**網址：** https://fa3go.github.io/

---

## 功能

### 桌面系統
- 可拖曳、調整大小的視窗，支援最小化 / 最大化 / 關閉
- 桌面圖示（單擊選取、雙擊開啟）
- 開始選單、工作列、系統時鐘

### 內容視窗
| 視窗 | 說明 |
|------|------|
| 關於我 | 個人簡介與技術技能標籤 |
| 我的作品 | 專案展示 |
| 相簿 | 圖片瀏覽與全螢幕檢視器 |
| 聯絡方式 | 社群媒體連結 |
| 記事本 | 可即時編輯的記事本 |
| 太空射擊 | 內建像素風格射擊遊戲 |

### 太空射擊遊戲
- 5 個關卡，各有不同敵人排列模式
- 敵人會主動發射子彈
- 3 條生命制
- 操作：`← →` 移動，`空白鍵` 發射

---

## 技術棧

- **HTML5 / CSS3 / JavaScript** — 核心架構與 Windows 95 風格介面
- **Canvas API** — 遊戲圖形渲染
- **Google Fonts** — Pixelify Sans 像素字體
- **Font Awesome** — 圖示系統
- **GitHub Pages** — 靜態網站部署

---

## 檔案結構

```
Fa3Go.github.io/
├── index.html          # 主頁面（Windows 95 桌面）
├── space-shooter.html  # 遊戲頁面
├── space-shooter.js    # 遊戲邏輯
├── player.js           # 玩家相關邏輯
├── images/             # 桌面圖示圖片
└── .github/workflows/  # GitHub Pages 部署設定
```

---

## 本地開發

```bash
git clone https://github.com/Fa3Go/Fa3Go.github.io.git
cd Fa3Go.github.io

# 使用 Python 啟動本地伺服器
python -m http.server 8000
```

---

## 作者

**Fa3Go** — [@Fa3Go](https://github.com/Fa3Go)
