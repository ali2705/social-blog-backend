const express = require("express");
const { getPendingPosts } = require("../models/postModel");
const { getPendingComments } = require("../models/commentModel");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Recupera tutti i contenuti in attesa di approvazione
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Solo admin possono vedere i contenuti in attesa di approvazione
    if (req.user.tipo_utente !== "admin") {
      return res.status(403).json({ message: "Non autorizzato." });
    }

    // Recuperiamo tutti i contenuti in attesa
    const posts = await getPendingPosts();
    const comments = await getPendingComments();

    res.json({
      posts,
      comments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Errore durante il recupero dei contenuti in attesa." });
  }
});

module.exports = router;
