const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('../config.json');
const imageRoutes = require('./routes/images');
const commentRoutes = require('./routes/comments');
const ImageScanner = require('./utils/imageScan');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../frontend'))); // 前端页面
app.use('/uploads', express.static('uploads')); // 图片文件

// API路由
app.use('/api/images', imageRoutes);
app.use('/api/comments', commentRoutes);

// 所有其他GET请求返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

const PORT = config.server.port || 3000;
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://${config.server.host}:${PORT}`);
  
  // 启动时扫描图片并开始监控
  await ImageScanner.scanAndImport();
  ImageScanner.watchDirectories();
});
