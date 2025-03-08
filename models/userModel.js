const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Funzione per ottenere un utente in base all'ID
const getUserById = async (id) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

// Funzione per ottenere un utente in base all'email
const getUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

// Funzione per creare un nuovo utente
const createUser = async (nome, email, password, tipo_utente) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (nome, email, password, tipo_utente) VALUES (?, ?, ?, ?)",
      [nome, email, hashedPassword, tipo_utente]
    );
    return result.insertId;
  } catch (err) {
    console.error("Errore durante la creazione dell'utente:", err);
    throw new Error("Errore nella registrazione dell'utente");
  }
};

// Funzione per aggiornare la password dell'utente
const updatePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE users SET password = ? WHERE id = ?", [
    hashedPassword,
    id,
  ]);
};

// Funzione per verificare la password
const verifyPassword = async (inputPassword, storedPassword) => {
  return bcrypt.compare(inputPassword, storedPassword);
};

// Funzione per cambiare il tipo di utente (ad esempio da "seguito" a "proprietario")
const updateUserType = async (id, tipo_utente) => {
  await db.query("UPDATE users SET tipo_utente = ? WHERE id = ?", [
    tipo_utente,
    id,
  ]);
};

module.exports = {
  getUserById,
  getUserByEmail,
  createUser,
  updatePassword,
  verifyPassword,
  updateUserType,
};
