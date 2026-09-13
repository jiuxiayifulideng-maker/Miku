const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../auth');

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '请输入管理员账号和密码'
    });
  }

  if (!verifyAdmin(username, password)) {
    return res.status(401).json({
      success: false,
      message: '账号或密码错误'
    });
  }

  req.session.user = {
    username,
    role: 'admin',
    loginAt: new Date().toISOString()
  };

  return res.json({
    success: true,
    user: req.session.user
  });
});

router.post('/logout', (req, res) => {
  req.session = null;
  return res.json({ success: true });
});

router.get('/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ success: false, message: '未登录' });
  }
  return res.json({ success: true, user: req.session.user });
});

module.exports = router;
