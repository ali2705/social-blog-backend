const {
  getUserByEmail,
  createUser,
  verifyPassword,
} = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("../config/db");

// Registrazione dell'utente
const register = async (req, res) => {
  const { nome, email, password, tipo_utente } = req.body;
  console.log(
    "Dati arrivati alla richiesta:",
    nome,
    email,
    password,
    tipo_utente
  );

  try {
    // Controlla se l'email esiste già
    const user = await getUserByEmail(email);
    if (user) {
      return res.status(400).json({ message: "Email già in uso!" });
    }

    // Crea l'utente nel database
    const userId = await createUser(nome, email, password, tipo_utente);

    // Se l'utente è di tipo "seguito", segui automaticamente le pagine dell'admin
    if (tipo_utente === "seguito") {
      console.log(
        "L'utente è di tipo seguito, assegnazione automatica dei follow..."
      );

      // Trova tutte le pagine di proprietà degli admin
      const [adminPages] = await db.query(
        `SELECT sp.id FROM social_pages sp
         JOIN users u ON sp.id_proprietario = u.id
         WHERE u.tipo_utente = 'admin'`
      );

      if (adminPages.length > 0) {
        // Crea richieste di follow per tutte le pagine dell'admin
        const followValues = adminPages.map((page) => [
          userId,
          page.id,
          "approvato",
        ]);
        await db.query(
          "INSERT INTO follows (id_utente, id_pagina, stato) VALUES ?",
          [followValues]
        );
        console.log(
          `Utente ${userId} ora segue automaticamente ${adminPages.length} pagine degli admin.`
        );
      }
    }

    // Rispondi con successo
    res
      .status(201)
      .json({ message: "Utente registrato con successo!", userId });
  } catch (err) {
    console.error("Errore nella registrazione dell'utente:", err);
    res
      .status(500)
      .json({ message: "Errore nella registrazione dell'utente." });
  }
};

// Login dell'utente
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(400).json({ message: "Credenziali non valide!" });
    }

    const token = jwt.sign(
      { id: user.id, tipo_utente: user.tipo_utente },
      process.env.JWT_SECRET
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Errore durante il login." });
  }
};

module.exports = { register, login };
