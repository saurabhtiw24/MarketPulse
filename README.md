# MarketPulse India 🇮🇳

Live NSE stock tracker with AI analysis — 300+ stocks, real-time prices, Trader & Investor modes.

---

## 🚀 Deploy: GitHub → Netlify (2 steps)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/marketpulse-india.git
git push -u origin main
```

### Step 2 — Connect Netlify + Add API Key
1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Select your GitHub repo
3. Build settings are auto-detected from `netlify.toml` — don't change anything
4. Before clicking Deploy, go to **Environment variables** and add:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...your key here...`
5. Click **Deploy site**

That's it. Every future `git push` auto-redeploys. ✅

---

## 🔐 How the API Key is Protected

Your Anthropic API key is **never in the browser**. The flow is:

```
User browser  →  /.netlify/functions/ai-analyze  →  Anthropic API
                 (runs on Netlify's servers)         (key stays here)
```

The key lives only in Netlify's environment variables — not in any source file.

---

## 📁 Project Structure

```
marketpulse-india/
├── netlify/
│   └── functions/
│       └── ai-analyze.js     ← Serverless function (keeps API key secret)
├── public/
│   └── index.html
├── src/
│   ├── api/market.js         ← Market data + calls serverless function
│   ├── components/
│   │   ├── Chat.jsx
│   │   ├── DetailPanel.jsx
│   │   ├── Spark.jsx
│   │   └── StockRow.jsx
│   ├── data/stocks.js        ← 300+ NSE stocks database
│   ├── utils/format.js
│   ├── App.jsx
│   └── index.js
├── .gitignore
├── netlify.toml              ← Build config + security headers
└── package.json
```

---

## ⚠️ Disclaimer
Educational purposes only. Not investment advice. Consult a SEBI-registered advisor before investing.
