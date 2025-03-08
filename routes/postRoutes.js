const express = require("express");
const {
  createPost,
  getPendingPosts,
  approvePost,
  rejectPost,
  getUserFeed,
  toggleLike,
  checkLikeStatus,
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const upload = require("../middleware/upload");

router.use(cors());

// Creazione di un post (solo per i proprietari)
router.post("/", authMiddleware, upload.single("immagine"), createPost);

// Ottiene tutti i post in attesa di approvazione (solo admin)
router.get("/pending", authMiddleware, getPendingPosts);

// Approva un post
router.put("/:postId/approve", authMiddleware, approvePost);

// Rifiuta un post
router.put("/:postId/reject", authMiddleware, rejectPost);

// Recupera il feed dell'utente autenticato
router.get("/feed", authMiddleware, getUserFeed);

// Mette o rimuove il like a un post
router.post("/:postId/like", authMiddleware, toggleLike);

// Verifica se un post è stato likato dall'utente autenticato
router.get("/:postId/like-status", authMiddleware, checkLikeStatus);

module.exports = router;
