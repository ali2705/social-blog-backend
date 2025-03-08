const db = require("../config/db");

const followPage = async (req, res) => {
  const { id_pagina, id_utente } = req.body;
  console.log("Richiesta di follow arrivata:", req.body);

  if (!id_utente) {
    return res.status(400).json({ message: "ID utente mancante." });
  }

  try {
    // Controlliamo se esiste già una richiesta di follow
    const [existingFollow] = await db.query(
      "SELECT id FROM follows WHERE id_utente = ? AND id_pagina = ?",
      [id_utente, id_pagina]
    );

    console.log("Risultato della query existingFollow:", existingFollow);

    if (existingFollow && existingFollow.length > 0) {
      return res.status(400).json({
        message: "Hai già inviato una richiesta di follow a questa pagina.",
      });
    }

    await db.query(
      "INSERT INTO follows (id_utente, id_pagina, stato) VALUES (?, ?, ?)",
      [id_utente, id_pagina, "in_attesa"]
    );

    res.status(201).json({ message: "Richiesta di follow inviata!" });
  } catch (err) {
    console.error("Errore nella richiesta di follow:", err);
    res.status(500).json({ message: "Errore nella richiesta di follow." });
  }
};

const approveFollow = async (req, res) => {
  const { id_follow } = req.params;

  try {
    const [rows] = await db.query("UPDATE follows SET stato = ? WHERE id = ?", [
      "approvato",
      id_follow,
    ]);

    res.json({ message: "Follow approvato!" });
  } catch (err) {
    console.error("Errore nell'approvazione del follow:", err);
    res.status(500).json({ message: "Errore nell'approvazione del follow." });
  }
};

// Rifiuta una richiesta di follow
const rejectFollow = async (req, res) => {
  const { id_follow } = req.params;

  try {
    const [rows] = await db.query("UPDATE follows SET stato = ? WHERE id = ?", [
      "rifiutato",
      id_follow,
    ]);

    res.json({ message: "Follow rifiutato!" });
  } catch (err) {
    console.error("Errore nel rifiuto del follow:", err);
    res.status(500).json({ message: "Errore nel rifiuto del follow." });
  }
};

const getPendingFollows = async (req, res) => {
  const { userId } = req.params; // ID del proprietario delle pagine

  try {
    // Step 1: Recupera tutte le pagine appartenenti al proprietario
    const [pages] = await db.query(
      "SELECT id FROM social_pages WHERE id_proprietario = ?",
      [userId]
    );

    // Se il proprietario non ha pagine, restituiamo un messaggio
    if (pages.length === 0) {
      return res
        .status(404)
        .json({ message: "Nessuna pagina trovata per questo proprietario." });
    }

    // Step 2: Estrarre gli ID delle pagine
    const pageIds = pages.map((page) => page.id);

    // Step 3: Recuperare le richieste di follow in attesa, unendo le tabelle users e social_pages
    const [pendingFollows] = await db.query(
      `SELECT 
         f.id AS follow_id, 
         f.data_creazione, 
         u.id AS user_id, 
         u.nome AS username, 
         p.id AS page_id, 
         p.nome_pagina AS page_name 
       FROM follows f
       JOIN users u ON f.id_utente = u.id
       JOIN social_pages p ON f.id_pagina = p.id
       WHERE f.id_pagina IN (?) AND f.stato = 'in_attesa'`,
      [pageIds]
    );

    // Se non ci sono follow in attesa, restituiamo un messaggio
    if (pendingFollows.length === 0) {
      return res
        .status(200)
        .json({ message: "Nessun follow in attesa per le tue pagine." });
    }

    // Restituiamo i follow in attesa con le informazioni dell'utente e della pagina
    return res.status(200).json(pendingFollows);
  } catch (err) {
    console.error("Errore nel recupero dei follow in attesa:", err);
    return res
      .status(500)
      .json({ message: "Errore nel recupero dei follow in attesa." });
  }
};

module.exports = { followPage, approveFollow, getPendingFollows, rejectFollow };
