const likesService = require('../services/likes.service');

async function listLikes(req, res) {
  try {
    const result = await likesService.getPostLikes(req.params.id);

    if (result.notFound) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(result.users);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function likePost(req, res) {
  try {
    const { userId } = req.body || {};

    if (userId === undefined || userId === null) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await likesService.addLike(req.params.id, userId);

    if (result.postNotFound) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (result.userNotFound) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (result.alreadyLiked) {
      return res.status(409).json({ error: 'Already liked' });
    }

    return res.status(201).json(result.like);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function unlikePost(req, res) {
  try {
    const { id, userId } = req.params;

    const result = await likesService.removeLike(id, userId);

    if (result.notFound) {
      return res.status(404).json({ error: 'Like not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = {
  listLikes,
  likePost,
  unlikePost,
};
