# SeasonTrip Backend

一个面向旅游资讯网站的标准 Node.js 后端，包含：

- 管理员登录
- Session 权限控制
- 管理员账户：`an`
- 默认密码：`1234`
- 旅游市场指标 CRUD
- 季节趋势 CRUD
- 目的地 CRUD
- 攻略 CRUD
- 前台公开 API
- SQLite 本地数据库
- Helmet 安全头
- CORS 配置
- 管理后台 API

## 1. 安装

```bash
npm install
```

## 2. 配置

复制 `.env.example` 为 `.env`。

默认开发环境：

```env
PORT=3000
SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=an
ADMIN_PASSWORD=1234
CORS_ORIGIN=http://localhost:3000
```

正式部署时请务必修改 `SESSION_SECRET` 和管理员密码。

## 3. 启动

```bash
npm start
```

打开：

- API: http://localhost:3000
- 管理后台登录页: http://localhost:3000/admin/login.html

## 4. 主要 API

### 登录

POST `/api/auth/login`

```json
{
  "username": "an",
  "password": "1234"
}
```

### 当前管理员

GET `/api/auth/me`

### 登出

POST `/api/auth/logout`

### 前台公开

- GET `/api/public/market`
- GET `/api/public/trends`
- GET `/api/public/destinations`
- GET `/api/public/guides`

### 后台管理

需要登录：

- GET/POST `/api/admin/market`
- GET/POST `/api/admin/trends`
- GET/POST `/api/admin/destinations`
- GET/POST `/api/admin/guides`
- PUT/DELETE 对应 `/:id`

## 数据结构

`market`
- label
- value
- trend
- tone

`trends`
- season
- subtitle
- tag
- points JSON
- labels JSON
- insights JSON

`destinations`
- name
- rating
- description
- image
- tags JSON

`guides`
- type
- category
- title
- description
- meta
- published

## 与现有前端对接

把你现有前端中的静态数据替换为：

```js
const [market, trends, destinations, guides] = await Promise.all([
  fetch('/api/public/market').then(r => r.json()),
  fetch('/api/public/trends').then(r => r.json()),
  fetch('/api/public/destinations').then(r => r.json()),
  fetch('/api/public/guides').then(r => r.json())
]);
```
