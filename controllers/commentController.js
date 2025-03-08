const db = require("../config/db");

// Creazione di un commento
const createComment = async (req, res) => {
  const { postId, commentData } = req.body;
  const { id } = req.user;
  console.log("Valori passati alla query:", postId, id, commentData);

  const { contenuto } = commentData;

  try {
    const [rows] = await db.query(
      "INSERT INTO comments (id_post, id_autore, contenuto) VALUES (?, ?, ?)",
      [postId, id, contenuto]
    );

    res.status(201).json({ message: "Commento creato con successo!" });
  } catch (err) {
    console.error("Errore nel salvataggio del commento:", err);
    res.status(500).json({ message: "Errore nella creazione del commento." });
  }
};

// Approva o boccia un commento
const approveComment = async (req, res) => {
  const { id_commento } = req.params;
  const { stato_approvazione } = req.body;

  try {
    const [rows] = await db.query(
      "UPDATE comments SET stato_approvazione = ? WHERE id = ?",
      [stato_approvazione, id_commento]
    );

    res.json({ message: "Stato del commento aggiornato con successo!" });
  } catch (err) {
    res.status(500).json({ message: "Errore nell'approvazione del commento." });
  }
};

const getPostComments = async (req, res) => {
  const { postId } = req.params; // Otteniamo l'ID del post dai parametri della richiesta
  console.log("Richiesta per i commenti del post:", postId);
  try {
    const [comments] = await db.query(
      `SELECT c.id, c.id_post, c.id_autore, u.nome , c.contenuto, c.stato_approvazione, c.data_creazione
       FROM comments c
       JOIN users u ON c.id_autore = u.id
       WHERE c.id_post = ? AND c.stato_approvazione = 'approvato'
       ORDER BY c.data_creazione DESC`,
      [postId]
    );

    console.log(comments);
    res.json(comments);
  } catch (err) {
    console.error("Errore nel recupero dei commenti:", err);
    res.status(500).json({ message: "Errore nel recupero dei commenti." });
  }
};

const getPendingComments = async (req, res) => {
  const { ownerId } = req.params;

  console.log("Richiesta per i commenti da approvare per l'utente:", ownerId);
  try {
    const query = `
    SELECT c.id, c.contenuto, c.data_creazione, c.id_post, u.nome AS autore, p.titolo AS post_titolo
    FROM comments c
    JOIN posts p ON c.id_post = p.id
    JOIN social_pages pa ON p.id_pagina = pa.id
    JOIN users u ON c.id_autore = u.id
    WHERE pa.id_proprietario = ? AND c.stato_approvazione = 'in_attesa'
    ORDER BY c.data_creazione DESC
  `;

    const [comments] = await db.query(query, [ownerId]);
    console.log("Commenti da approvare:", comments);

    res.json(comments);
  } catch (error) {
    console.error("Errore nel recupero dei commenti da approvare:", error);
    res.status(500).json({ message: "Errore nel recupero dei commenti." });
  }
};

module.exports = {
  createComment,
  approveComment,
  getPostComments,
  getPendingComments,
};
