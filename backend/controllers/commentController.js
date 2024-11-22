const Comment = require('../models/Comment');
const { validationResult } = require('express-validator');

class CommentController {
  // 获取图片的评论
  static async getImageComments(req, res) {
    try {
      const imageId = req.params.imageId;
      const comments = await Comment.findByImage(imageId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: '获取评论失败' });
    }
  }

  // 添加评论
  static async addComment(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comment = await Comment.create({
        image_id: req.body.image_id,
        content: req.body.content
      });
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: '添加评论失败' });
    }
  }
}

module.exports = CommentController;
