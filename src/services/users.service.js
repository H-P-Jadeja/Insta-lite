const prisma = require('../db');

async function createUser(data) {
  return await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      fullname: data.fullname,
      bio: data.bio !== undefined ? data.bio : null,
    },
  });
}

async function listUsers({ skip, limit, sortBy = 'createdAt', order = 'desc', isPrivate, search, hasPosts }) {
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (hasPosts !== undefined) {
    where.posts = hasPosts ? { some: {} } : { none: {} };
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { fullname: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
}

async function getUserById(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  return await prisma.user.findUnique({
    where: { id: numericId },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
}

async function updateUser(id, data) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  const existing = await prisma.user.findUnique({
    where: { id: numericId },
  });
  if (!existing) return null;

  const updateData = {};
  if (data.fullname !== undefined) updateData.fullname = data.fullname;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.isPrivate !== undefined) updateData.isPrivate = data.isPrivate;

  return await prisma.user.update({
    where: { id: numericId },
    data: updateData,
  });
}

async function deleteUser(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  const existing = await prisma.user.findUnique({
    where: { id: numericId },
  });
  if (!existing) return null;

  await prisma.user.delete({
    where: { id: numericId },
  });
  return true;
}

async function getUserPosts(userId, { skip, limit }) {
  const numericId = Number(userId);
  if (isNaN(numericId)) return null;

  const user = await prisma.user.findUnique({
    where: { id: numericId },
  });
  if (!user) return null;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: { authorId: numericId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({
      where: { authorId: numericId },
    }),
  ]);

  return { data: posts, total };
}

async function getUserLikedPosts(userId, { skip, limit }) {
  const numericId = Number(userId);
  if (isNaN(numericId)) return null;

  const user = await prisma.user.findUnique({
    where: { id: numericId },
  });
  if (!user) return null;

  const where = {
    likes: {
      some: {
        userId: numericId,
      },
    },
  };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { data: posts, total };
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
};
