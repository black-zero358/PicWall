const fs = require('fs').promises;
const path = require('path');
const Image = require('../models/Image');
const config = require('../../config.json');
const chokidar = require('chokidar'); // 改用 chokidar

class ImageScanner {
  static async scanAndImport() {
    try {
      // 遍历配置中的所有分类
      for (const category of config.categories) {
        const categoryPath = category.path;
        const categoryTag = category.tag;
        
        // 确保目录存在
        await fs.mkdir(categoryPath, { recursive: true });
        
        // 读取目录下的所有文件
        const files = await fs.readdir(categoryPath);
        
        // 过滤出图片文件
        const imageFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        });

        // 检查每个图片是否已在数据库中
        for (const filename of imageFiles) {
          const imagePath = `/${category.path}/${filename}`;
          
          // 检查数据库中是否已存在
          const exists = await Image.findByPath(imagePath);
          if (!exists) {
            // 添加到数据库
            await Image.create({
              filename,
              category: categoryTag,
              path: imagePath,
              likes: 0
            });
            console.log(`导入图片: ${filename}`);
          }
        }
      }
      console.log('图片扫描和导入完成');
    } catch (error) {
      console.error('扫描图片失败:', error);
    }
  }

  static watchDirectories() {
    const watcher = chokidar.watch(config.categories.map(c => c.path), {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true
    });

    watcher.on('add', async filepath => {
      const ext = path.extname(filepath).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        const filename = path.basename(filepath);
        const category = config.categories.find(c => 
          filepath.includes(c.path)
        );
        
        if (category) {
          const imagePath = `/${path.relative('uploads', filepath).replace(/\\/g, '/')}`;
          
          try {
            const exists = await Image.findByPath(imagePath);
            if (!exists) {
              await Image.create({
                filename,
                category: category.tag,
                path: imagePath,
                likes: 0
              });
              console.log(`新图片已添加: ${filename}`);
            }
          } catch (error) {
            console.error(`添加图片失败 ${filename}:`, error);
          }
        }
      }
    });

    console.log('开始监控图片目录变化');
  }
}

module.exports = ImageScanner;
