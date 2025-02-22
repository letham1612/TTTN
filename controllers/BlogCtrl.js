const Blog = require("../models/BlogModel");

// Create a new blog
const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get a single blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Increment the number of views
    blog.numViews += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update a blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedBlog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete a blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Like a blog
const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Toggle like
    if (blog.likes.includes(userId)) {
      blog.likes.pull(userId);
      blog.isLiked = false;
    } else {
      blog.likes.push(userId);
      blog.isLiked = true;
      // Remove dislike if it exists
      blog.dislikes.pull(userId);
      blog.isDisliked = false;
    }

    await blog.save();
    res.status(200).json({ success: true, data: {
        blog,
        totalLikes: blog.likes.length,
        totalDislikes: blog.dislikes.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Dislike a blog
const dislikeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Toggle dislike
    if (blog.dislikes.includes(userId)) {
      blog.dislikes.pull(userId);
      blog.isDisliked = false;
    } else {
      blog.dislikes.push(userId);
      blog.isDisliked = true;
      // Remove like if it exists
      blog.likes.pull(userId);
      blog.isLiked = false;
    }

    await blog.save();
    res.status(200).json({ success: true, data: {
        blog,
        totalLikes: blog.likes.length,
        totalDislikes: blog.dislikes.length,
      }, });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
};
