const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('../config.json');
const imageRoutes = require('./routes/images');
const commentRoutes = require('./routes/comments');
const ImageScanner = require('./utils/imageScan');
const SymlinkManager = require('./utils/symlink');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../frontend'))); // 前端页面
// 确保uploads目录映射正确
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // 图片文件

// API路由
app.use('/api/images', imageRoutes);
app.use('/api/comments', commentRoutes);

// 所有��他GET请求返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

// 初始化函数
async function initialize() {
    // 创建符号链接
    await SymlinkManager.createSymlinks();
    // 扫描���导入图片
    await ImageScanner.scanAndImport();
    // 开始监控图片变化
    ImageScanner.watchDirectories();
}

const PORT = config.server.port || 3000;
// 启动服务器并初始化
app.listen(PORT, async () => {
    console.log(`服务器运行在 http://${config.server.host}:${PORT}`);
    await initialize();
});
