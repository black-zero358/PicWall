const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { body, validationResult } = require('express-validator');

// 输入验证中间件
const validateComment = [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('评论内容不能为空且不超过500字符'),
  body('image_id').isInt().withMessage('图片ID无效')
];

// 获取指定图片的所有评论
router.get('/:imageId', async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const comments = await Comment.findByImage(imageId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: '获取评论失败' });
  }
});

// 添加新评论
router.post('/', validateComment, async (req, res) => {
  // 验证输入
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const comment = {
      image_id: req.body.image_id,
      content: req.body.content
    };
    const commentId = await Comment.create(comment);
    res.status(201).json({ 
      id: commentId,
      message: '评论添加成功' 
    });
  } catch (error) {
    res.status(500).json({ message: '添加评论失败' });
  }
});

module.exports = router;
