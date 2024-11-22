# PicWall - 现代化图片展示网站

一个基于Express和SQLite的轻量级图片展示网站，特色是响应式瀑布流布局、实时交互和优雅的UI设计。

## 核心特性

### 图片展示

- 基于Masonry.js的自适应瀑布流布局
- 智能响应式布局：
  - 桌面端: 4列布局
  - 平板端: 3列布局
  - 移动端: 2列布局
- 图片懒加载与无限滚动 (20张/页)
- 支持JPG/JPEG/PNG/GIF格式
- 支持按时间/热度排序
- 标签式分类导航
- 实时图片目录扫描与更新 (使用chokidar)

### 实时交互功能

- 图片点赞计数
- 实时评论系统
  - 评论字数限制 (1-500字)
  - 实时字数统计
- 模态框图片预览
- 全局错误处理与日志记录

### UI/UX设计

- 毛玻璃效果固定导航栏
- 流畅过渡动画
- 现代圆角设计
- 移动端优化的触摸操作
- 自定义美化滚动条
- 深色模式支持

## 技术栈

### 前端

- 原生JavaScript (ES6+)
- CSS3 (包含响应式设计)
- Masonry.js (瀑布流布局)
- HTML5

### 后端

- Node.js
- Express.js (RESTful API)
- SQLite3 (数据库)
- Chokidar (文件监控)
- Multer (文件上传)
- Express-validator (数据验证)
- CORS (跨域资源共享)

## 安装与使用

1. **克隆项目**

   ```bash
   git clone [项目地址]
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **配置项目**

   - 复制 `config.example.json` 为 `config.json`
   - 根据需要修改配置

4. **创建必要目录**

   ```bash
   mkdir uploads database
   ```

5. **启动服务**

   ```bash
   npm start    # 生产环境
   npm run dev  # 开发环境 (支持热重载)
   ```

## API接口

### 图片相关

```
GET    /api/images                     # 获取所有图片
GET    /api/images?page=1&category=all&sort=time  # 获取分类图片，支持分页和排序
POST   /api/images/upload              # 上传图片
PUT    /api/images/:id/like            # 点赞图片
GET    /api/images/:id                  # 获取单个图片信息
```

### 评论相关

```
GET    /api/comments/:imageId          # 获取指定图片的所有评论
POST   /api/comments                   # 添加新评论
```

## 数据库设计

### images表

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

### comments表

```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES images (id)
);
```

## 配置说明

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

## 技术实现

### 前端

- **懒加载与无限滚动**

  使用原生JavaScript实现图片的懒加载和分页加载，当用户滚动接近页面底部时自动加载更多图片。

- **分类与排序功能**

  用户可以通过分类按钮切换不同类别的图片，通过下拉框选择排序方式（时间排序或热度排序）。

- **实时交互**

  实现图片的点赞与评论功能，使用模态框展示图片详情及相关交互。

### 后端

- **图片管理**

  使用Chokidar监控上传目录，实时扫描并导入新图片到数据库。

- **API接口**

  提供RESTful API接口，支持图片的获取、上传、点赞，以及评论的获取与添加。

- **数据验证与安全**

  使用express-validator对API请求进行数据验证，确保数据的有效性和安全性。

- **错误处理**

  全局错误处理中间件处理服务器内部错误，前端提供全局错误和未捕获Promise错误处理。

## 性能优化

### 前端优化

- 图片懒加载减少初始加载时间
- 事件节流控制滚动请求
- CSS硬件加速提升动画性能
- 分页加载控制内存占用

### 后端优化

- 图片压缩和格式验证
- SQLite索引优化
- 请求数据验证
- 错误处理中间件

## 主题定制

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

## 目录结构

```
pic-wall/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── commentController.js
│   ├── models/
│   │   ├── Comment.js
│   │   └── Image.js
│   ├── routes/
│   │   ├── comments.js
│   │   └── images.js
│   ├── utils/
│   │   └── imageScan.js
│   ├── server.js
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── grid.css
│   │   │   ├── main.css
│   │   │   └── mobile.css
│   │   └── js/
│   │       ├── interact.js
│   │       ├── main.js
│   │       ├── masonry.js
│   │       └── sort.js
│   └── index.html
├── uploads/
├── database/
├── config.json
├── .gitignore
├── package.json
└── readme.md
```

## 注意事项

1. **目录权限**：确保 `uploads` 和 `database` 目录有写入权限。
2. **上传限制**：默认图片上传大小限制为5MB。
3. **支持格式**：支持的图片格式包括 `.jpg`, `.jpeg`, `.png`, `.gif`。
4. **部署建议**：建议使用PM2等进程管理器部署以确保应用稳定运行。
5. **移动端测试**：移动端测试需注意内存占用，确保流畅体验。

## 快速开始

1. **克隆项目**

   ```bash
   git clone [项目地址]
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **配置项目**

   - 根据需要修改`config.json`配置

4. **创建必要目录**

   ```bash
   mkdir uploads database
   ```

5. **启动服务**

   ```bash
   npm start    # 生产环境
   npm run dev  # 开发环境 (支持热重载)
   ```

## 贡献

欢迎提交issues和pull requests来贡献你的想法和改进！
