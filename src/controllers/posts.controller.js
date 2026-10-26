const postsService = require('../services/posts.service');
const { parsePagination, formatPaginationMeta } = require('../utils/pagination');

async function create(req, res) {
  try {
    const { imageUrl, authorId, caption, location } = req.body || {};

    if (!imageUrl || authorId === undefined || authorId === null) {
      return res.status(400).json({ error: 'imageUrl and authorId are required' });
    }

    const numericAuthorId = Number(authorId);
    if (isNaN(numericAuthorId)) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await postsService.createPost({
      imageUrl,
      authorId: numericAuthorId,
      caption,
      location,
    });

    if (result.notFound) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(201).json(result.post);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function list(req, res) {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }

    const { sortBy = 'createdAt', order = 'desc', location, search, from, to } = req.query;

    const allowedSortBy = ['createdAt', 'updatedAt', 'likes'];
    if (!allowedSortBy.includes(sortBy)) {
      return res.status(400).json({
        error: 'sortBy must be one of: createdAt, updatedAt, likes',
      });
    }

    const allowedOrder = ['asc', 'desc'];
    if (!allowedOrder.includes(order)) {
      return res.status(400).json({
        error: 'order must be asc or desc',
      });
    }

    const isValidDate = (d) => {
      const parsed = new Date(d);
      return !isNaN(parsed.getTime());
    };

    if ((from !== undefined && !isValidDate(from)) || (to !== undefined && !isValidDate(to))) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }

    const { data, total } = await postsService.listPosts({
      skip: pagination.skip,
      limit: pagination.limit,
      sortBy,
      order,
      location: location ? location.trim() : undefined,
      search: search ? search.trim() : undefined,
      from,
      to,
    });

    return res.status(200).json({
      data,
      meta: formatPaginationMeta(total, pagination.page, pagination.limit),
    });
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
