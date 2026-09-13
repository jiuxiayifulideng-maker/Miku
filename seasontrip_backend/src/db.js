const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'seasontrip.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS market (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    trend TEXT NOT NULL DEFAULT '',
    tone TEXT NOT NULL DEFAULT 'up',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season TEXT NOT NULL UNIQUE,
    subtitle TEXT NOT NULL DEFAULT '',
    tag TEXT NOT NULL DEFAULT '',
    points_json TEXT NOT NULL DEFAULT '[]',
    labels_json TEXT NOT NULL DEFAULT '[]',
    insights_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS destinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating REAL NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    tags_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS guides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    meta TEXT NOT NULL DEFAULT '',
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function seed() {
  const marketCount = db.prepare('SELECT COUNT(*) AS count FROM market').get().count;
  if (marketCount === 0) {
    const insert = db.prepare(`
      INSERT INTO market (label, value, trend, tone)
      VALUES (?, ?, ?, ?)
    `);
    const rows = [
      ['国际出行热度', '+18.6%', '↑ 环比增长', 'up'],
      ['平均提前预订', '27天', '↑ 适合规划', 'up'],
      ['周末价格溢价', '+23%', '↑ 高于工作日', 'down'],
      ['轻户外偏好', '64%', '↑ 年轻客群显著', 'up']
    ];
    const tx = db.transaction(items => items.forEach(row => insert.run(...row)));
    tx(rows);
  }

  const trendCount = db.prepare('SELECT COUNT(*) AS count FROM trends').get().count;
  if (trendCount === 0) {
    const insert = db.prepare(`
      INSERT INTO trends
      (season, subtitle, tag, points_json, labels_json, insights_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const rows = [
      ['summer', '夏季过去 6 个月的相对热度变化', '旺季 · 注意价格波动',
        JSON.stringify([52,58,64,72,86,78]),
        JSON.stringify(['03月','04月','05月','06月','07月','08月']),
        JSON.stringify([
          ['沿海度假热度','海岛和山海目的地继续保持高热度。'],
          ['机酒价格','提前 21–35 天预订通常更稳妥。'],
          ['人流变化','工作日出发可明显降低核心景区拥挤感。'],
          ['趋势建议','选择“次旺季 + 周中”组合，通常更划算。']
        ])
      ],
      ['autumn', '秋季过去 6 个月的相对热度变化', '舒适季 · 性价比提升',
        JSON.stringify([76,74,69,66,61,68]),
        JSON.stringify(['05月','06月','07月','08月','09月','10月']),
        JSON.stringify([
          ['红叶目的地','山地、温泉与古都的关注度开始上升。'],
          ['机酒价格','热门红叶区域建议提前 30–45 天锁定。'],
          ['人流变化','10 月下旬通常比黄金周更舒适。'],
          ['趋势建议','把“红叶预测 + 周中出发”作为核心策略。']
        ])
      ],
      ['winter', '冬季过去 6 个月的相对热度变化', '分化季 · 滑雪升温',
        JSON.stringify([62,54,48,57,70,79]),
        JSON.stringify(['07月','08月','09月','10月','11月','12月']),
        JSON.stringify([
          ['冰雪目的地','滑雪场、温泉与灯会城市持续升温。'],
          ['机酒价格','节假日期间溢价明显，建议分段比价。'],
          ['人流变化','雪季热门场地周末集中度更高。'],
          ['趋势建议','选择非核心周末，体验与价格更平衡。']
        ])
      ],
      ['spring', '春季过去 6 个月的相对热度变化', '舒适季 · 花季驱动',
        JSON.stringify([45,52,59,67,74,69]),
        JSON.stringify(['11月','12月','01月','02月','03月','04月']),
        JSON.stringify([
          ['花季热度','赏樱、花田与郊野轻徒步关注度走高。'],
          ['机酒价格','花期变化大，尽量使用可退改产品。'],
          ['人流变化','核心花季景点的峰值时段更明显。'],
          ['趋势建议','错开周末，把热门景点放到开门前。']
        ])
      ]
    ];
    const tx = db.transaction(items => items.forEach(row => insert.run(...row)));
    tx(rows);
  }

  const destinationCount = db.prepare('SELECT COUNT(*) AS count FROM destinations').get().count;
  if (destinationCount === 0) {
    const insert = db.prepare(`
      INSERT INTO destinations (name, rating, description, image, tags_json)
      VALUES (?, ?, ?, ?, ?)
    `);
    const rows = [
      ['北海道', 4.9, '适合：秋色、咖啡馆、自驾与慢旅行。推荐 5–7 天。',
       'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=900&q=85',
       JSON.stringify(['自然','摄影','自驾'])],
      ['京都', 4.8, '适合：古都散步、茶屋、寺院与四季景观。推荐 3–5 天。',
       'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85',
       JSON.stringify(['人文','美食','摄影'])],
      ['冲绳', 4.7, '适合：海岛、浮潜、日落与亲子度假。推荐 4–6 天。',
       'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=85',
       JSON.stringify(['海岛','度假','亲子'])]
    ];
    const tx = db.transaction(items => items.forEach(row => insert.run(...row)));
    tx(rows);
  }

  const guideCount = db.prepare('SELECT COUNT(*) AS count FROM guides').get().count;
  if (guideCount === 0) {
    const insert = db.prepare(`
      INSERT INTO guides (type, category, title, description, meta, published)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const rows = [
      ['CITY','city','京都 4 天游：古都散步不走回头路','清水寺—祇园—哲学之道—岚山，按区域组织路线，减少通勤损耗。','4天 · 人均 ¥2,800+',1],
      ['NATURE','nature','北海道自驾：7 天山海与温泉线','适合第一次北海道自驾，覆盖札幌、小樽、美瑛、富良野和温泉区。','7天 · 自驾',1],
      ['FOOD','food','福冈美食地图：拉面之外吃什么','屋台、海鲜、烧鸟与咖啡馆，按街区整理高效吃法。','3天 · 美食',1],
      ['BUDGET','budget','日本旅行预算怎么做：从机票到交通','给出住宿、交通、餐饮与门票的预算框架，适合第一次规划。','预算 · 规划',1],
      ['CITY','city','东京周末：雨天也能玩的城市路线','商圈、展览、书店与室内体验组合，不让天气打乱行程。','2天 · 城市',1],
      ['NATURE','nature','轻徒步攻略：把景区玩得更慢一点','从鞋子、补水到节奏控制，适合新手的半日轻徒步方法。','半日 · 户外',1]
    ];
    const tx = db.transaction(items => items.forEach(row => insert.run(...row)));
    tx(rows);
  }
}

seed();

module.exports = db;
