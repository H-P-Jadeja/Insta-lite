const postsService = require('../services/posts.service');

async function create(req, res) {
  try {
    const { imageUrl, caption, location } = req.body || {};

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const post = await postsService.createPost({
      imageUrl,
      caption,
      location,
    });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function list(req, res) {
  try {
    const posts = await postsService.listPosts();
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function getOne(req, res) {
  try {
    const post = await postsService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function update(req, res) {
  try {
    const { caption, location } = req.body || {};

    const updatedPost = await postsService.updatePost(req.params.id, {
      caption,
      location,
    });

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(updatedPost);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function remove(req, res) {
  try {
    const deleted = await postsService.deletePost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
