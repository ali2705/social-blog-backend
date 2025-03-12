const db = require("../config/db");

// Creazione di un post
const createPost = async (req, res) => {
  const { titolo, contenuto, id_pagina } = req.body;
  const immagine = req.file ? `${req.file.filename}` : null; // Salva il percorso dell'immagine

  if (!titolo || !contenuto || !id_pagina) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO posts (titolo, contenuto, id_pagina, immagine_copertina, stato_approvazione, data_creazione) VALUES (?, ?, ?, ?, 'in_attesa', NOW())",
      [titolo, contenuto, id_pagina, immagine]
    );

    res.status(201).json({
      message: "Il post sarà visibile dopo l'approvazione!",
      postId: result.insertId,
    });
  } catch (error) {
    console.error("Errore nel salvataggio del post:", error);
    res.status(500).json({ message: "Errore nel salvataggio del post." });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query(
      "SELECT id, titolo, contenuto, immagine_copertina, data_creazione FROM posts WHERE stato_approvazione = 'approvato' ORDER BY data_creazione DESC"
    );
    res.status(200).json(posts);
  } catch (error) {
    console.error("Errore nel recupero dei post:", error);
    res.status(500).json({ message: "Errore nel recupero degli articoli." });
  }
};

// Recupera il feed di un utente
const getUserFeed = async (req, res) => {
  const { id } = req.user; // ID dell'utente autenticato
  console.log("Richiesta del feed per l'utente con ID:", id);

  try {
    const [posts] = await db.query(
      `SELECT p.*
       FROM posts p
       JOIN social_pages sp ON p.id_pagina = sp.id
       JOIN follows f ON sp.id = f.id_pagina
       WHERE f.id_utente = ? 
         AND f.stato = 'approvato' 
         AND p.stato_approvazione = 'approvato'
       ORDER BY p.data_creazione DESC`,
      [id]
    );

    console.log("Risultato della query:", posts);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Errore nel recupero del feed utente." });
  }
};

// Ottiene tutti i post in attesa di approvazione
const getPendingPosts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.id_pagina, p.titolo, p.contenuto, p.immagine_copertina, p.data_creazione, 
              sp.nome_pagina 
       FROM posts p
       JOIN social_pages sp ON p.id_pagina = sp.id
       WHERE p.stato_approvazione = 'in_attesa'
       ORDER BY p.data_creazione DESC`
    );

    if (rows.length === 0) {
      return res
        .status(200)
        .json({ message: "Nessun post in attesa di approvazione." });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Errore nel recupero dei post in attesa:", error);
    res
      .status(500)
      .json({ message: "Errore nel recupero dei post in attesa." });
  }
};

// Approva un post
const approvePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE posts SET stato_approvazione = 'approvato' WHERE id = ?",
      [postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Post non trovato." });
    }

    res.status(200).json({ message: "Post approvato con successo." });
  } catch (error) {
    console.error("Errore nell'approvazione del post:", error);
    res.status(500).json({ message: "Errore nell'approvazione del post." });
  }
};

// Rifiuta un post
const rejectPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE posts SET stato_approvazione = 'bocciato' WHERE id = ?",
      [postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Post non trovato." });
    }

    res.status(200).json({ message: "Post rifiutato con successo." });
  } catch (error) {
    console.error("Errore nel rifiuto del post:", error);
    res.status(500).json({ message: "Errore nel rifiuto del post." });
  }
};

// Aggiunge o rimuove un like a un post
const toggleLike = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user; // ID dell'utente autenticato

  try {
    // Controlla se l'utente ha già messo like al post
    const [existingLike] = await db.query(
      "SELECT * FROM post_likes WHERE id_post = ? AND id_utente = ?",
      [postId, userId]
    );

    if (existingLike.length > 0) {
      // Se il like esiste già, lo rimuoviamo
      await db.query(
        "DELETE FROM post_likes WHERE id_post = ? AND id_utente = ?",
        [postId, userId]
      );
      console.log(
        `❌ Like rimosso - Post ID: ${postId} | Utente ID: ${userId}`
      );
    } else {
      // Se il like non esiste, lo aggiungiamo
      await db.query(
        "INSERT INTO post_likes (id_post, id_utente) VALUES (?, ?)",
        [postId, userId]
      );
      console.log(
        `✅ Like aggiunto - Post ID: ${postId} | Utente ID: ${userId}`
      );
    }

    // Conta il numero di likes dopo la modifica
    const [likesCount] = await db.query(
      "SELECT COUNT(*) as totalLikes FROM post_likes WHERE id_post = ?",
      [postId]
    );

    console.log(
      `📊 Totale likes per Post ID ${postId}:`,
      likesCount[0].totalLikes
    );
    return res.status(200).json({ likesCount: likesCount[0].totalLikes });
  } catch (error) {
    console.error("❌ Errore nel gestire il like:", error);
    res.status(500).json({ message: "Errore nel gestire il like." });
  }
};

// Controlla se l'utente ha messo like a un post
const checkLikeStatus = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const [like] = await db.query(
      "SELECT * FROM post_likes WHERE id_post = ? AND id_utente = ?",
      [postId, userId]
    );

    const liked = like.length > 0;
    console.log(
      `🔍 Verifica like - Post ID: ${postId} | Utente ID: ${userId} | Liked: ${liked}`
    );

    // Conta il numero totale di likes per il post
    const [likesCount] = await db.query(
      "SELECT COUNT(*) as totalLikes FROM post_likes WHERE id_post = ?",
      [postId]
    );

    console.log(
      `📊 Totale likes per Post ID ${postId}:`,
      likesCount[0].totalLikes
    );

    return res.json({ liked, likesCount: likesCount[0].totalLikes });
  } catch (error) {
    console.error("❌ Errore nel verificare il like:", error);
    res.status(500).json({ message: "Errore nel verificare il like." });
  }
};

module.exports = {
  createPost,
  getPendingPosts,
  approvePost,
  rejectPost,
  getUserFeed,
  toggleLike,
  checkLikeStatus,
  getAllPosts,
};
