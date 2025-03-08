const express = require("express");
const {
  createComment,
  approveComment,
  getPostComments,
  getPendingComments, // Nuova funzione nel controller
} = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.use(cors());

// Creazione di un commento
router.post("/", authMiddleware, createComment);

// Approva o boccia un commento
router.put("/:id_commento/approve", approveComment);

// Ottiene i commenti di un post
router.get("/:postId", getPostComments);

// Nuova route: Ottiene i commenti da approvare per le pagine di un utente
router.get("/pending/:ownerId", authMiddleware, getPendingComments);

module.exports = router;
