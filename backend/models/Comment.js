const sqlite3 = require('sqlite3').verbose();
const config = require('../../config.json');
const db = new sqlite3.Database(config.database.path);

db.run(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (image_id) REFERENCES images (id)
)`);

class Comment {
  static async create(comment) {
    const { image_id, content } = comment;
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO comments (image_id, content) VALUES (?, ?)",
        [image_id, content],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  static async findByImage(imageId) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM comments WHERE image_id = ? ORDER BY created_at DESC",
        [imageId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }
}

module.exports = Comment;
