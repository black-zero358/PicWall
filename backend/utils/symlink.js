const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

class SymlinkManager {
    static async createSymlinks() {
        try {
            // 确保uploads目录存在
            const uploadsDir = path.resolve(__dirname, '../../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // 遍历配置中的所有分类
            for (const category of config.categories) {
                const sourcePath = path.resolve(__dirname, '../../', category.path);
                const targetPath = path.join(uploadsDir, category.tag);

                // 检查源路径是否存在
                if (!fs.existsSync(sourcePath)) {
                    console.error(`源目录不存在: ${sourcePath}`);
                    continue;
                }

                // 如果目标已存在，先删除（如果是符号链接）
                if (fs.existsSync(targetPath)) {
                    const stats = fs.lstatSync(targetPath);
                    if (stats.isSymbolicLink()) {
                        fs.unlinkSync(targetPath);
                    } else {
                        console.error(`目标路径已存在且不是符号链接: ${targetPath}`);
                        continue;
                    }
                }

                // 创建符号链接
                await fs.promises.symlink(sourcePath, targetPath, 'junction');
                console.log(`创建符号链接: ${sourcePath} -> ${targetPath}`);
            }
        } catch (error) {
            console.error('创建符号链接失败:', error);
        }
    }
}

module.exports = SymlinkManager;
