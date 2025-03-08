const db = require("../config/db");

// Recupera tutti i commenti in attesa di approvazione
const getPendingComments = async () => {
  const [rows] = await db.query(
    'SELECT * FROM comments WHERE stato = "in_attesa"'
  );
  return rows;
};

// Funzione per approvare o rifiutare un commento
const updateCommentStatus = async (id, status) => {
  await db.query("UPDATE comments SET stato = ? WHERE id = ?", [status, id]);
};

module.exports = {
  getPendingComments,
  updateCommentStatus,
};
