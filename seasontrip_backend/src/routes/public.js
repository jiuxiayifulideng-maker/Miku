const express = require('express');
const router = express.Router();
const db = require('../db');

function parseJsonField(rows, fields) {
  return rows.map(row => {
    const next = { ...row };
    for (const field of fields) {
      try {
        next[field.replace('_json','')] = JSON.parse(row[field] || '[]');
      } catch {
        next[field.replace('_json','')] = [];
      }
      delete next[field];
    }
    return next;
  });
}

router.get('/market', (req,res) => {
  const rows = db.prepare('SELECT id,label,value,trend,tone FROM market ORDER BY id').all();
  res.json({ success:true, data:rows });
});

router.get('/trends', (req,res) => {
  const rows = db.prepare('SELECT * FROM trends ORDER BY id').all();
  res.json({ success:true, data:parseJsonField(rows, ['points_json','labels_json','insights_json']) });
});

router.get('/destinations', (req,res) => {
  const rows = db.prepare('SELECT id,name,rating,description,image,tags_json FROM destinations ORDER BY id').all();
  res.json({ success:true, data:parseJsonField(rows, ['tags_json']) });
});

router.get('/guides', (req,res) => {
  const rows = db.prepare(`
    SELECT id,type,category,title,description,meta,published
    FROM guides
    WHERE published = 1
    ORDER BY id DESC
  `).all();
  res.json({ success:true, data:rows });
});

module.exports = router;
