const db = require("../config/db");

// Recupera tutti i post in attesa di approvazione
const getPendingPosts = async () => {
  const [rows] = await db.query(
    'SELECT * FROM posts WHERE st   ato = "in_attesa"'
  );
  return rows;
};

// Funzione per approvare o rifiutare un post
const updatePostStatus = async (id, status) => {
  await db.query("UPDATE posts SET stato = ? WHERE id = ?", [status, id]);
};

module.exports = {
  getPendingPosts,
  updatePostStatus,
};
