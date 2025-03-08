const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const pageRoutes = require("./routes/pageRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const followRoutes = require("./routes/followRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const approvalRoutes = require("./routes/approvalRoutes");
const path = require("path");

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/pages", authMiddleware, pageRoutes);
app.use("/api/posts", authMiddleware, postRoutes);
app.use("/api/comments", authMiddleware, commentRoutes);
app.use("/api/follows", authMiddleware, followRoutes);
app.use("/api/approval", approvalRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
