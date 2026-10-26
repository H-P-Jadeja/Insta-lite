const usersService = require('../services/users.service');

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
    const users = await usersService.listUsers();
    return res.status(200).json(users);
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

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
