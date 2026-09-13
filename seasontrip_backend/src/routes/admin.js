const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

const jsonFields = {
  trends: ['points','labels','insights'],
  destinations: ['tags']
};

function bodyValue(body, key, fallback='') {
  return body?.[key] ?? fallback;
}

function serialize(value) {
  return typeof value === 'string' ? value : JSON.stringify(value ?? []);
}

/* =========================
   MARKET
========================= */
router.get('/market', (req,res) => {
  res.json({success:true,data:db.prepare('SELECT * FROM market ORDER BY id').all()});
});

router.post('/market', (req,res) => {
  const {label,value,trend,tone='up'} = req.body || {};
  if(!label || !value) return res.status(400).json({success:false,message:'label 和 value 必填'});
  const info = db.prepare(`
    INSERT INTO market(label,value,trend,tone,updated_at)
    VALUES(?,?,?,?,CURRENT_TIMESTAMP)
  `).run(label,value,trend || '',tone);
  res.status(201).json({success:true,id:info.lastInsertRowid});
});

router.put('/market/:id', (req,res) => {
  const {label,value,trend,tone='up'} = req.body || {};
  const info = db.prepare(`
    UPDATE market SET label=?,value=?,trend=?,tone=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(label,value,trend || '',tone,req.params.id);
  if(!info.changes) return res.status(404).json({success:false,message:'记录不存在'});
  res.json({success:true});
});

router.delete('/market/:id', (req,res) => {
  const info = db.prepare('DELETE FROM market WHERE id=?').run(req.params.id);
  if(!info.changes) return res.status(404).json({success:false,message:'记录不存在'});
  res.json({success:true});
});

/* =========================
   TRENDS
========================= */
router.get('/trends', (req,res) => {
  const rows = db.prepare('SELECT * FROM trends ORDER BY id').all();
  res.json({success:true,data:rows.map(r => ({
    ...r,
    points: JSON.parse(r.points_json),
    labels: JSON.parse(r.labels_json),
    insights: JSON.parse(r.insights_json)
  }))});
});

router.post('/trends', (req,res) => {
  const {season,subtitle='',tag='',points=[],labels=[],insights=[]} = req.body || {};
  if(!season) return res.status(400).json({success:false,message:'season 必填'});
  const info = db.prepare(`
    INSERT INTO trends(season,subtitle,tag,points_json,labels_json,insights_json,updated_at)
    VALUES(?,?,?,?,?,?,CURRENT_TIMESTAMP)
  `).run(season,subtitle,tag,serialize(points),serialize(labels),serialize(insights));
  res.status(201).json({success:true,id:info.lastInsertRowid});
});

router.put('/trends/:id', (req,res) => {
  const {season,subtitle='',tag='',points=[],labels=[],insights=[]} = req.body || {};
  const info = db.prepare(`
    UPDATE trends
    SET season=?,subtitle=?,tag=?,points_json=?,labels_json=?,insights_json=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(season,subtitle,tag,serialize(points),serialize(labels),serialize(insights),req.params.id);
  if(!info.changes) return res.status(404).json({success:false,message:'记录不存在'});
  res.json({success:true});
});

router.delete('/trends/:id', (req,res) => {
  const info = db.prepare('DELETE FROM trends WHERE id=?').run(req.params.id);
  if(!info.changes) return res.status(404).json({success:false,message:'记录不存在'});
  res.json({success:true});
});

/* =========================
   DESTINATIONS
========================= */
router.get('/destinations', (req,res) => {
  const rows = db.prepare('SELECT * FROM destinations ORDER BY id').all();
  res.json({success:true,data:rows.map(r=>({
    ...r,
    tags:JSON.parse(r.tags_json)
  }))});
});

router.post('/destinations', (req,res) => {
  const {name,rating=0,description='',image='',tags=[]} = req.body || {};
  if(!name) return res.status(400).json({success:false,message:'name 必填'});
  const info = db.prepare(`
    INSERT INTO destinations(name,rating,description,image,tags_json,updated_at)
    VALUES(?,?,?,?,?,CURRENT_TIMESTAMP)
  `).run(name,Number(rating)||0,description,image,serialize(tags));
  res.status(201).json({success:true,id:info.lastInsertRowid});
});

router.put('/destinations/:id', (req,res) => {
  const {name,rating=0,description='',image='',tags=[]} = req.body || {};
  const info = db.prepare(`
    UPDATE destinations
    SET name=?,rating=?,description=?,image=?,tags_json=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(name,Number(rating)||0,description,image,serialize(tags),req.params.id);
  if(!info.changes) return res.status(404).json({success:false,message:'记录不存在'});
  res.json({success:true});
});

router.delete('/destinations/:id', (req,res) => {
  const info = db.prepare('DELETE FROM destinations WHERE id=?').run(req.params.id);
  if(!info.changes) return res.status(404).json({success:false,message:'记录不存在'});
  res.json({success:true});
});

/* =========================
   GUIDES
========================= */
router.get('/guides', (req,res) => {
  res.json({success:true,data:db.prepare('SELECT * FROM guides ORDER BY id DESC').all()});
});

router.post('/guides', (req,res) => {
  const {type,category,title,description='',meta='',published=1} = req.body || {};
  if(!type || !category || !title) return res.status(400).json({success:false,message:'type、category、title 必填'});
  const info = db.prepare(`
    INSERT INTO guides(type,category,title,description,meta,published,updated_at)
    VALUES(?,?,?,?,?,?,CURRENT_TIMESTAMP)
  `).run(type,category,title,description,meta,published ? 1 : 0);
  res.status(201).json({success:true,id:info.lastInsertRowid});
});

router.put('/guides/:id', (req,res) => {
  const {type,category,title,description='',meta='',published=1} = req.body || {};
  const info = db.prepare(`
    UPDATE guides
    SET type=?,category=?,title=?,description=?,meta=?,published=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(type,category,title,description,meta,published ? 1 : 0,req.params.id);
  if(!info.changes) return res.status(404).json({success:false,message:'记录不存在'});
  res.json({success:true});
});

router.delete('/guides/:id', (req,res) => {
  const info = db.prepare('DELETE FROM guides WHERE id=?').run(req.params.id);
  if(!info.changes) return res.status(404).json({success:false,message:'记录不存在'});
  res.json({success:true});
});

module.exports = router;
