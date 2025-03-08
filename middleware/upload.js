const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // ✅ Salva nella cartella "uploads"
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Estrai estensione (.jpg, .png, ecc.)
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_"); // Rimuovi spazi
    cb(null, baseName + "_" + Date.now() + ext); // ✅ Nome leggibile (ai_18_1738236090065.jpg)
  },
});

const upload = multer({ storage });

module.exports = upload;
