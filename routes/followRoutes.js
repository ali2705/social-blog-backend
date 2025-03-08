const express = require("express");
const {
  followPage,
  approveFollow,
  rejectFollow,
  getPendingFollows,
} = require("../controllers/followController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.use(cors());

// Richiesta di follow da parte di un utente (solo per i seguiti)
router.post("/", authMiddleware, followPage);

// Ottenere i follow in attesa per le pagine di un proprietario
router.get("/pending/:userId", authMiddleware, getPendingFollows);

// Approva una richiesta di follow (solo per i proprietari delle pagine)
router.put("/:id_follow/approve", authMiddleware, approveFollow);

// Rifiuta una richiesta di follow (solo per i proprietari delle pagine)
router.put("/:id_follow/reject", authMiddleware, rejectFollow);

module.exports = router;
