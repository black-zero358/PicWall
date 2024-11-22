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
        const categoryPath = path.resolve(__dirname, '../../', category.path);
        const categoryTag = category.tag;
        
        // 确保目录存在
        await fs.mkdir(categoryPath, { recursive: true });
        console.log(`扫描目录: ${categoryPath}`);
        
        // 读取目录下的所有文件
        const files = await fs.readdir(categoryPath);
        
        // 过滤出图片文件
        const imageFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        });

        // 检查每个图片是否已在数据库中
        for (const filename of imageFiles) {
          // 修改为使用uploads前缀的路径
          const imagePath = `/uploads/${path.relative(path.resolve(__dirname, '../../uploads'), path.join(categoryPath, filename)).replace(/\\/g, '/')}`;
          
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
    const watchPaths = config.categories.map(c => path.resolve(__dirname, '../../', c.path));
    const watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true
    });

    watcher.on('add', async filepath => {
      console.log(`检测到新文件: ${filepath}`);
      const ext = path.extname(filepath).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        const filename = path.basename(filepath);
        const category = config.categories.find(c => filepath.includes(path.resolve(__dirname, '../../', c.path)));
        
        if (category) {
          // 修改为使用uploads前缀的路径
          const imagePath = `/uploads/${path.relative(path.resolve(__dirname, '../../uploads'), filepath).replace(/\\/g, '/')}`;
          
          try {
            const exists = await Image.findByPath(imagePath);
            if (!exists) {
              await Image.create({
                filename,
                category: category.tag,
                path: imagePath,  // 保存正确的相对路径到数据库
                likes: 0
              });
              console.log(`新图片已添加: ${filename}`);
            } else {
              console.log(`图片已存在: ${filename}`);
            }
          } catch (error) {
            console.error(`添加图片失败 ${filename}:`, error);
          }
        }
      }
    });

    watcher.on('error', error => {
      console.error('Watcher 错误:', error);
    });

    console.log('开始监控图片目录变化');
  }
}

module.exports = ImageScanner;
