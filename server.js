const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Prage', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));


// 初始化資料庫
const db = new sqlite3.Database('./bp_records.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the blood pressure database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        time TEXT NOT NULL,
        period TEXT NOT NULL,
        sys1 INTEGER, dia1 INTEGER,
        sys2 INTEGER, dia2 INTEGER,
        sys3 INTEGER, dia3 INTEGER,
        avg_sys INTEGER,
        avg_dia INTEGER,
        discarded_idx INTEGER,
        UNIQUE(username, time, period)
    )`);
});

// ... (中間 API 保持不變)

// API: 匯入 JSON (智慧合併，自動去重)
app.post('/api/import/:username', (req, res) => {
    const username = req.params.username;
    const records = req.body;
    if (!Array.isArray(records)) return res.status(400).json({ error: '無效的資料格式' });

    let importedCount = 0;
    db.serialize(() => {
        // 使用 INSERT OR IGNORE 確保重複數據 (時間+姓名+時段相同) 會被自動跳過
        const stmt = db.prepare(`INSERT OR IGNORE INTO records (username, time, period, sys1, dia1, sys2, dia2, sys3, dia3, avg_sys, avg_dia, discarded_idx) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        records.forEach(r => {
            const raw = r.raw || [{sys:r.sys1, dia:r.dia1}, {sys:r.sys2, dia:r.dia2}, {sys:r.sys3, dia:r.dia3}];
            const avg = r.average || {sys:r.avg_sys, dia:r.avg_dia};
            stmt.run(username, r.time, r.period, raw[0].sys, raw[0].dia, raw[1].sys, raw[1].dia, raw[2].sys, raw[2].dia, avg.sys, avg.dia, r.discardedIdx || r.discarded_idx);
        });

        stmt.finalize((err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '智慧匯入完成，重複紀錄已自動過濾。' });
        });
    });
});

app.listen(port, () => {

    console.log(`Server running at http://localhost:${port}`);
});
