require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieSession = require('cookie-session');

require('./auth');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || `http://localhost:${PORT}`,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.use(cookieSession({
  name: 'seasontrip_session',
  keys: [process.env.SESSION_SECRET || 'change-this-in-production'],
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 1000 * 60 * 60 * 8
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req,res) => {
  res.json({
    success: true,
    service: 'seasontrip-backend',
    time: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use((req,res) => {
  res.status(404).json({success:false,message:'接口不存在'});
});

app.use((err,req,res,next) => {
  console.error(err);
  res.status(500).json({success:false,message:'服务器内部错误'});
});

app.listen(PORT, () => {
  console.log(`SeasonTrip backend running at http://localhost:${PORT}`);
});
