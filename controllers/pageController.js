const db = require("../config/db");

// Creazione di una nuova pagina
const createPage = async (req, res) => {
  const { nome_pagina, descrizione } = req.body;
  const { id } = req.user; // ID dell'utente autenticato
  const immagine_copertina = req.file ? `uploads/${req.file.filename}` : null;

  if (!nome_pagina || !descrizione) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO social_pages (nome_pagina, id_proprietario, descrizione, immagine_copertina, data_creazione) VALUES (?, ?, ?, ?, NOW())",
      [nome_pagina, id, descrizione, immagine_copertina]
    );

    res.status(201).json({
      message: "Pagina creata con successo!",
      pageId: result.insertId,
    });
  } catch (error) {
    console.error("Errore nella creazione della pagina:", error);
    res.status(500).json({ message: "Errore nella creazione della pagina." });
  }
};

// Visualizzazione delle pagine create dall'utente
const getCreatedPages = async (req, res) => {
  const { id } = req.user;

  try {
    const [pages] = await db.query(
      "SELECT * FROM social_pages WHERE id_proprietario = ?",
      [id]
    );
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: "Errore nel recupero delle pagine." });
  }
};

const getAllPages = async (req, res) => {
  console.log("Richiesta di pagine arrivata");

  try {
    // Esegui la query per ottenere le pagine dal database
    const [rows] = await db.query(
      `SELECT * FROM social_pages ORDER BY data_creazione DESC`
    );
    res.json(rows); // Invia la risposta con i dati delle pagine
  } catch (error) {
    console.error("Errore nel recupero delle pagine:", error);
    res.status(500).json({ message: "Errore nel recupero delle pagine" });
  }
};

const getPostsByPage = async (req, res) => {
  console.log(
    "Richiesta ricevuta a /posts/:id_pagina con ID:",
    req.params.id_pagina
  );
  const { id_pagina } = req.params;

  try {
    const [posts] = await db.query(
      "SELECT * FROM posts WHERE id_pagina = ? AND stato_approvazione = 'approvato' ORDER BY data_creazione DESC",
      [id_pagina]
    );

    console.log("Query eseguita. Risultato:", posts);

    if (!posts || posts.length === 0) {
      console.log("Nessun post trovato per la pagina con ID:", id_pagina);
      return res
        .status(404)
        .json({ message: "Nessun post trovato per questa pagina." });
    }

    console.log("Invio dei post per la pagina con ID:", id_pagina);
    res.json(posts);
  } catch (err) {
    console.error(
      "Errore nel recupero dei post per la pagina con ID:",
      id_pagina,
      err
    );
    res.status(500).json({ message: "Errore interno del server.", error: err });
  }
};

const getPageDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM social_pages WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pagina non trovata." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Errore nel recupero dei dettagli della pagina:", error);
    res.status(500).json({ message: "Errore nel recupero della pagina." });
  }
};

const getPagesByOwner = async (req, res) => {
  const { id } = req.user;

  try {
    const [pages] = await db.query(
      "SELECT * FROM social_pages WHERE id_proprietario = ? ORDER BY data_creazione DESC",
      [id]
    );

    if (pages.length === 0) {
      return res
        .status(404)
        .json({ message: "Nessuna pagina trovata per questo utente." });
    }

    res.json(pages);
  } catch (err) {
    console.error("Errore nel recupero delle pagine dell'utente:", err);
    res.status(500).json({ message: "Errore interno del server." });
  }
};

module.exports = {
  createPage,
  getCreatedPages,
  getAllPages,
  getPostsByPage,
  getPageDetails,
  getPagesByOwner,
};
