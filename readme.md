# PicWall - 现代化图片展示网站

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

> 一个基于Express和SQLite的轻量级图片展示网站，特色是响应式瀑布流布局、实时交互和优雅的UI设计。

## 📑 目录

- [环境要求](#-环境要求)
- [核心特性](#-核心特性)
- [快速开始](#-快速开始)
- [项目配置](#-项目配置)
- [API文档](#-api文档)
- [技术实现](#-技术实现)
- [开发指南](#-开发指南)
- [性能优化](#-性能优化)
- [错误处理](#-错误处理)
- [目录结构](#-目录结构)
- [贡献指南](#-贡献指南)

## 🔧 环境要求

- Node.js >= 14.0.0
- NPM >= 6.0.0
- SQLite3
- 现代浏览器支持 (Chrome/Firefox/Safari/Edge)

## ✨ 核心特性

### 图片展示
- 基于原生JavaScript的自适应瀑布流布局
- 智能响应式布局：
  - 桌面端: 5列布局
  - 平板端: 3列布局
  - 移动端: 2列布局
- 图片懒加载与无限滚动触发点 (距底部1000px)
- 支持JPG/JPEG/PNG/GIF格式
- 支持时间和热度排序
- 分类标签导航 (全部/风景/人物)
- 使用Chokidar实现实时图片目录监控

### 实时交互功能
- 图片点赞功能，带状态记忆
- 评论系统
- 图片详情模态框
- 全局错误处理与Promise异常捕获

### UI/UX设计
- 固定式毛玻璃导航栏 (backdrop-filter)
- CSS变量主题定制
- 响应式适配
- 自定义滚动条美化
- 图片悬停动画效果

## 🚀 快速开始

### 1. 环境准备
```bash
# 检查Node.js版本
node --version  # 应 >= 14.0.0

# 检查npm版本
npm --version   # 应 >= 6.0.0
```

### 2. 安装部署

```bash
# 克隆项目
git clone [项目地址]
cd pic-wall

# 安装依赖
npm install

# 如果在中国大陆，建议使用npm镜像
npm install --registry=https://registry.npmmirror.com

# 复制配置文件
cp config.example.json config.json

# 创建必要目录
mkdir -p uploads/{风景,人物} database
chmod 755 uploads database

# 初始化数据库
node backend/utils/initDb.js
```

### 3. 启动服务

```bash
# 开发环境（支持热重载）
npm run dev

# 生产环境
npm start
```

## ⚙️ 项目配置

### 配置文件说明

在 `config.json` 中可配置：

```json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "gallery": {
    "columns": {
      "desktop": 4,
      "tablet": 3,
      "mobile": 2
    },
    "preloadCount": 20
  },
  "categories": [
    {
      "path": "uploads/风景",
      "tag": "风景"
    },
    {
      "path": "uploads/人物",
      "tag": "人物"
    }
    // 可根据需要添加更多分类
  ],
  "database": {
    "path": "database/picwall.db"
  }
}
```

## 📖 API文档

### 图片管理接口

```http
# 获取图片列表
GET /api/images
Query参数:
  - page: 页码 (默认: 1)
  - limit: 每页数量 (默认: 20)
  - category: 分类 (all/风景/人物)
  - sort: 排序方式 (time/likes)

响应示例:
{
  "status": "success",
  "data": {
    "images": [...],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}

# 上传图片
POST /api/images/upload
Content-Type: multipart/form-data
Body:
  - image: 图片文件
  - category: 分类名称

# 获取图片详情
GET /api/images/:id
响应示例:
{
  "status": "success",
  "data": {
    "id": 1,
    "filename": "example.jpg",
    "category": "风景",
    "likes": 10,
    "path": "/uploads/风景/example.jpg",
    "created_at": "2024-02-12T04:29:00.000Z"
  }
}
```

### 评论管理接口

```http
# 获取评论列表
GET /api/comments/:imageId
Query参数:
  - page: 页码 (默认: 1)
  - limit: 每页数量 (默认: 20)

# 添加评论
POST /api/comments
Content-Type: application/json
Body:
{
  "image_id": 1,
  "content": "真是一张好照片！"
}
```

## 💻 技术实现

### 技术栈概览

#### 前端技术
- 原生JavaScript (ES6+)
- CSS3 (包含响应式设计)
- Masonry.js (瀑布流布局)
- HTML5

#### 后端技术
- Node.js
- Express.js (RESTful API)
- SQLite3 (数据库)
- Chokidar (文件监控)
- Multer (文件上传)
- Express-validator (数据验证)
- CORS (跨域资源共享)

### 数据库设计

#### images表

```sql
CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    category TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### comments表

```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES images (id)
);
```

## 📝 开发指南

### 新功能开发流程

1. **添加新的API端点**
   - 在 `backend/routes` 中创建路由文件
   - 在 `backend/controllers` 中实现控制器逻辑
   - 在 `backend/models` 中添加数据模型（如需要）
   - 在 `server.js` 中注册路由

2. **实现前端功能**
   - 在 `frontend/assets/js` 中添加相关JS文件
   - 在 `frontend/assets/css` 中添加样式
   - 在 `index.html` 中引入新文件

3. **添加新的数据表**
   ```sql
   -- 在 backend/config/db.js 中添加
   CREATE TABLE IF NOT EXISTS new_table (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       field1 TEXT NOT NULL,
       field2 INTEGER DEFAULT 0,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 代码规范

- 使用ESLint进行代码检查
- 遵循RESTful API设计规范
- 使用语义化的HTML标签
- CSS类名使用BEM命名规范
- 保持代码注释的完整性

## �� 性能优化

### 前端性能优化

- 图片懒加载减少初始加载时间
- 事件节流控制滚动请求
- CSS硬件加速提升动画性能
- 分页加载控制内存占用

### 后端性能优化

- 图片压缩和格式验证
- SQLite索引优化
- 请求数据验证
- 错误处理中间件

## ⚠️ 错误处理

### 前端错误处理

```javascript
// 全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', error);
    showErrorMessage('发生了一个错误，请刷新页面重试');
};

// Promise错误处理
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorMessage('网络请求失败，请检查网络连接');
});

// API错误处理
async function handleApiError(response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '请求失败');
    }
    return response.json();
}
```

### 后端错误处理

```javascript
// 全局错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: '请求的资源不存在'
    });
});
```

## 📁 目录结构

```
pic-wall/
├── 📂 backend/          # 后端代码
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── models/         # 数据模型
│   ├── routes/         # 路由定义
│   ├── utils/          # 工具函数
│   └── server.js       # 服务入口
├── 📂 frontend/         # 前端代码
│   ├── assets/         # 静态资源
│   │   ├── css/       # 样式文件
│   │   └── js/        # 脚本文件
│   └── index.html     # 主页面
├── 📂 uploads/          # 图片上传目录
├── 📂 database/         # 数据库文件
├── config.json         # 配置文件
├── package.json        # 项目依赖
└── readme.md          # 项目文档
```

## 🎨 主题定制

### CSS变量配置

```css
:root {
    --primary-color: #2196f3;     /* 主题色 */
    --primary-hover: #1976d2;     /* 悬停色 */
    --background-color: #f8f9fa;  /* 背景色 */
    --text-color: #2c3e50;        /* 文字色 */
    --border-color: #e0e0e0;      /* 边框色 */
    --shadow-color: rgba(0,0,0,0.1); /* 阴影色 */
    --modal-bg: rgba(0,0,0,0.75); /* 模态框背景 */
}
```

## ⚡ 注意事项

1. **目录权限**
   - 确保 `uploads` 和 `database` 目录有写入权限
   - 建议设置目录权限为755

2. **上传限制**
   - 默认图片上传大小限制：5MB
   - 支持格式：`.jpg`, `.jpeg`, `.png`, `.gif`

3. **部署建议**
   - 推荐使用PM2进行进程管理
   - 建议配置反向代理（如Nginx）
   - 生产环境需要配置SSL证书

4. **性能考虑**
   - 移动端需注意内存占用
   - 建议使用CDN加速静态资源
   - 合理配置图片压缩参数

## 🤝 贡献指南

我们非常欢迎社区贡献！如果你想参与项目开发，请：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request

## 📄 开源协议

本项目采用 AGPL-3.0 license 协议开源 - 查看 [LICENSE](LICENSE) 了解更多细节
