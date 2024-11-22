const sqlite3 = require('sqlite3').verbose();
const config = require('../../config.json');
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.db = new sqlite3.Database(config.database.path, (err) => {
          if (err) {
            reject(err);
          }
          console.log('数据库连接成功');
          this.init();
          resolve(this.db);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  init() {
    // 创建必要的表
    this.db.serialize(() => {
      this.db.run(`PRAGMA foreign_keys = ON`);
      
      // 创建图片表
      this.db.run(`CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        category TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // 创建评论表
      this.db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (image_id) REFERENCES images (id)
      )`);
    });
  }

  get() {
    return this.db;
  }
}

module.exports = new Database();
