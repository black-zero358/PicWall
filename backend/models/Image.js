const sqlite3 = require('sqlite3').verbose();
const config = require('../../config.json');
const db = new sqlite3.Database(config.database.path);

db.run(`CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  category TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

class Image {
  static async findAll(page = 1, category = 'all', sort = 'created_at DESC') {
    const limit = 20; // 每页显示数量
    const offset = (page - 1) * limit;
    
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM images";
      const params = [];

      if (category !== 'all') {
        query += " WHERE category = ?";
        params.push(category);
      }

      query += ` ORDER BY ${sort} LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows || []);
      });
    });
  }

  static async create(image) {
    const { filename, category, path, likes } = image;
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO images (filename, category, path, likes) VALUES (?, ?, ?, ?)",
        [filename, category, path, likes],
        function(err) {
          if (err) reject(err);
          resolve({
            id: this.lastID,
            ...image
          });
        }
      );
    });
  }

  static async findByPath(path) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM images WHERE path = ?", [path], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM images WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  static async updateLikes(id) {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE images SET likes = likes + 1 WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          db.get("SELECT likes FROM images WHERE id = ?", [id], (err, row) => {
            if (err) reject(err);
            resolve(row);
          });
        }
      );
    });
  }
}

module.exports = Image;
