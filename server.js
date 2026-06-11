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

// API: 取得特定使用者的所有紀錄
app.get('/api/records/:username', (req, res) => {
    const username = req.params.username;
    db.all(`SELECT * FROM records WHERE username = ? ORDER BY time DESC`, [username], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const records = rows.map(r => ({
            id: r.id,
            username: r.username,
            time: r.time,
            period: r.period,
            raw: [
                { sys: r.sys1, dia: r.dia1 },
                { sys: r.sys2, dia: r.dia2 },
                { sys: r.sys3, dia: r.dia3 }
            ],
            average: { sys: r.avg_sys, dia: r.avg_dia },
            avg_sys: r.avg_sys,
            avg_dia: r.avg_dia,
            discardedIdx: r.discarded_idx
        }));
        res.json(records);
    });
});

// API: 新增/更新一筆量測紀錄
app.post('/api/records', (req, res) => {
    const r = req.body;
    if (!r.username || !r.time || !r.period || !r.raw || !r.average) {
        return res.status(400).json({ error: '無效的資料格式' });
    }
    db.run(
        `INSERT OR REPLACE INTO records (username, time, period, sys1, dia1, sys2, dia2, sys3, dia3, avg_sys, avg_dia, discarded_idx)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            r.username,
            r.time,
            r.period,
            r.raw[0]?.sys || null,
            r.raw[0]?.dia || null,
            r.raw[1]?.sys || null,
            r.raw[1]?.dia || null,
            r.raw[2]?.sys || null,
            r.raw[2]?.dia || null,
            r.avg_sys || r.average.sys,
            r.avg_dia || r.average.dia,
            r.discardedIdx !== undefined ? r.discardedIdx : r.discarded_idx
        ],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '儲存成功' });
        }
    );
});

// API: 匯出 Excel
app.get('/api/export/:username', (req, res) => {
    const username = req.params.username;
    db.all(`SELECT * FROM records WHERE username = ? ORDER BY time DESC`, [username], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).send('尚無任何歷史紀錄可供匯出');

        const excelData = rows.map((r, i) => {
            return {
                '項次': rows.length - i,
                '量測時間': r.time.replace('T', ' '),
                '時段': r.period === 'Morning' ? '早上' : r.period === 'Noon' ? '中午' : '晚上',
                '第一次收縮壓': r.sys1 || '',
                '第一次舒張壓': r.dia1 || '',
                '第二次收縮壓': r.sys2 || '',
                '第二次舒張壓': r.dia2 || '',
                '第三次收縮壓': r.sys3 || '',
                '第三次舒張壓': r.dia3 || '',
                '排除量測序號': (r.discarded_idx || 0) + 1,
                '平均收縮壓': r.avg_sys || '',
                '平均舒張壓': r.avg_dia || ''
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "血壓紀錄表");

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', `attachment; filename="BP_Report_${encodeURIComponent(username)}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    });
});


// API: 匯入 JSON (智慧合併，自動去重)
app.post('/api/import/:username', async (req, res) => {
    const username = req.params.username;
    const records = req.body;
    if (!Array.isArray(records)) return res.status(400).json({ error: '無效的資料格式' });

    const runQuery = (query, params) => new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

    try {
        for (const r of records) {
            const raw = r.raw || [{sys:r.sys1, dia:r.dia1}, {sys:r.sys2, dia:r.dia2}, {sys:r.sys3, dia:r.dia3}];
            const avg = r.average || {sys:r.avg_sys, dia:r.avg_dia};
            await runQuery(
                `INSERT OR IGNORE INTO records (username, time, period, sys1, dia1, sys2, dia2, sys3, dia3, avg_sys, avg_dia, discarded_idx) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    username, 
                    r.time, 
                    r.period, 
                    raw[0]?.sys || null, raw[0]?.dia || null, 
                    raw[1]?.sys || null, raw[1]?.dia || null, 
                    raw[2]?.sys || null, raw[2]?.dia || null, 
                    avg.sys, 
                    avg.dia, 
                    r.discardedIdx !== undefined ? r.discardedIdx : r.discarded_idx
                ]
            );
        }
        res.json({ message: '智慧匯入完成，重複紀錄已自動過濾。' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: 刪除紀錄
app.delete('/api/records/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM records WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: '找不到該筆紀錄' });
        res.json({ message: '刪除成功' });
    });
});

app.listen(port, () => {

    console.log(`Server running at http://localhost:${port}`);
});
