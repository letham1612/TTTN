const express = require("express");
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
} = require("../controllers/BlogCtrl");

const router = express.Router();

// Routes for blogs
router.post("/", createBlog); // Create a new blog
router.get("/", getAllBlogs); // Get all blogs
router.get("/:id", getBlogById); // Get a single blog by ID
router.put("/:id", updateBlog); // Update a blog by ID
router.delete("/:id", deleteBlog); // Delete a blog by ID

// Routes for liking and disliking blogs
router.put("/:id/like", likeBlog); // Like a blog
router.put("/:id/dislike", dislikeBlog); // Dislike a blog

module.exports = router;