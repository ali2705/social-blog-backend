const express = require("express");
const {
  createPage,
  getCreatedPages,
  getAllPages,
  getPostsByPage,
  getPageDetails,
  getPagesByOwner,
} = require("../controllers/pageController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const multer = require("multer");
const path = require("path"); // Ensure path is required if you're using path.extname

router.use(cors());

// Define the storage configuration first
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory di destinazione per le immagini
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Estensione del file
    cb(null, Date.now() + ext); // Salva il file con un nome univoco basato sul timestamp
  },
});

// Then initialize the multer middleware with the storage configuration
const upload = multer({ storage: storage });

// Routes
router.post(
  "/",
  authMiddleware,
  upload.single("immagine_copertina"),
  createPage
);
router.get("/", authMiddleware, getCreatedPages); // Recupero delle pagine create dall'utente
router.get("/get-pages", authMiddleware, getAllPages); // Recupero di tutte le pagine
router.get("/posts/:id_pagina", getPostsByPage); // Recupero di tutti i post di una specifica pagina
router.get("/get-page-details/:id", authMiddleware, getPageDetails);
router.get("/owner", authMiddleware, getPagesByOwner); // route per ottenere le pagine di un proprietario

module.exports = router;
