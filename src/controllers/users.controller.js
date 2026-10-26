const usersService = require('../services/users.service');
const { parsePagination, formatPaginationMeta } = require('../utils/pagination');

async function create(req, res) {
  try {
    const { username, email, fullname, bio } = req.body || {};

    if (!username || !email || !fullname) {
      return res.status(400).json({
        error: 'username, email and fullname are required',
      });
    }

    const user = await usersService.createUser({
      username,
      email,
      fullname,
      bio,
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002' || (error.message && error.message.includes('Unique constraint'))) {
      return res.status(409).json({
        error: 'username or email already taken',
      });
    }
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function list(req, res) {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }

    const { sortBy = 'createdAt', order = 'desc', isPrivate, search, hasPosts } = req.query;

    const allowedSortBy = ['createdAt', 'username', 'fullname'];
    if (!allowedSortBy.includes(sortBy)) {
      return res.status(400).json({
        error: 'sortBy must be one of: createdAt, username, fullname',
      });
    }

    const allowedOrder = ['asc', 'desc'];
    if (!allowedOrder.includes(order)) {
      return res.status(400).json({
        error: 'order must be asc or desc',
      });
    }

    let parsedIsPrivate;
    if (isPrivate !== undefined) {
      if (isPrivate !== 'true' && isPrivate !== 'false') {
        return res.status(400).json({
          error: 'isPrivate must be true or false',
        });
      }
      parsedIsPrivate = isPrivate === 'true';
    }

    let parsedHasPosts;
    if (hasPosts !== undefined) {
      if (hasPosts !== 'true' && hasPosts !== 'false') {
        return res.status(400).json({
          error: 'hasPosts must be true or false',
        });
      }
      parsedHasPosts = hasPosts === 'true';
    }

    const { data, total } = await usersService.listUsers({
      skip: pagination.skip,
      limit: pagination.limit,
      sortBy,
      order,
      isPrivate: parsedIsPrivate,
      search: search ? search.trim() : undefined,
      hasPosts: parsedHasPosts,
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
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function update(req, res) {
  try {
    const { fullname, bio, isPrivate } = req.body || {};

    const updatedUser = await usersService.updateUser(req.params.id, {
      fullname,
      bio,
      isPrivate,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function remove(req, res) {
  try {
    const deleted = await usersService.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function getUserPosts(req, res) {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }

    const result = await usersService.getUserPosts(req.params.id, {
      skip: pagination.skip,
      limit: pagination.limit,
    });

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      data: result.data,
      meta: formatPaginationMeta(result.total, pagination.page, pagination.limit),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function getLikedPosts(req, res) {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }

    const result = await usersService.getUserLikedPosts(req.params.id, {
      skip: pagination.skip,
      limit: pagination.limit,
    });

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      data: result.data,
      meta: formatPaginationMeta(result.total, pagination.page, pagination.limit),
    });
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
  getUserPosts,
  getLikedPosts,
};
