const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/imageController');
const multer = require('multer');
const path = require('path');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 路由定义
router.get('/', ImageController.getAllImages);
router.get('/category/:category', ImageController.getImagesByCategory);
router.put('/:id/like', ImageController.updateLikes);
router.post('/upload', upload.single('image'), ImageController.uploadImage);

module.exports = router;
