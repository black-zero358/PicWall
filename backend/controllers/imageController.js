const Image = require('../models/Image');
const { validationResult } = require('express-validator');

class ImageController {
  // 获取所有图片
  static async getAllImages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const category = req.query.category || 'all';
      let sort = 'created_at DESC';
      
      if (req.query.sort === 'likes') {
        sort = 'likes DESC';
      }

      const images = await Image.findAll(page, category, sort);
      res.json(images);
    } catch (error) {
      console.error('获取图片失败:', error);
      res.status(500).json({ message: '获取图片失败' });
    }
  }

  // 按分类获取图片
  static async getImagesByCategory(req, res) {
    try {
      const category = req.params.category;
      const images = await Image.findByCategory(category);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: '获取分类图片失败' });
    }
  }

  // 获取单个图片
  static async getImage(req, res) {
    try {
      const imageId = req.params.id;
      const image = await Image.findById(imageId);
      if (!image) {
        return res.status(404).json({ message: '图片不存在' });
      }
      res.json(image);
    } catch (error) {
      res.status(500).json({ message: '获取图片失败' });
    }
  }

  // 更新点赞数
  static async updateLikes(req, res) {
    try {
      const imageId = req.params.id;
      const result = await Image.updateLikes(imageId);
      if (!result) {
        return res.status(404).json({ message: '图片不存在' });
      }
      res.json(result); // 确保返回包含likes的对象
    } catch (error) {
      res.status(500).json({ message: '点赞失败' });
    }
  }

  // 上传图片
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '没有上传文件' });
      }

      const newImage = {
        filename: req.file.filename,
        category: req.body.category || '未分类',
        path: `/uploads/${req.file.filename}`,
        likes: 0
      };

      // 假设有一个Image模型的create方法
      const image = await Image.create(newImage);
      
      res.status(201).json({
        message: '图片上传成功',
        image: image
      });
    } catch (error) {
      console.error('上传图片失败:', error);
      res.status(500).json({ message: '上传图片失败' });
    }
  }
}

module.exports = ImageController;
