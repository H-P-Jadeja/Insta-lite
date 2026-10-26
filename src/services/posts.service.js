const prisma = require('../db');

async function createPost(data) {
  const author = await prisma.user.findUnique({
    where: { id: data.authorId },
  });
  if (!author) {
    return { notFound: true };
  }

  const post = await prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      authorId: data.authorId,
      caption: data.caption !== undefined ? data.caption : null,
      location: data.location !== undefined ? data.location : null,
    },
  });

  return { post };
}

async function listPosts({ skip, limit, sortBy = 'createdAt', order = 'desc', location, search, from, to }) {
  const where = {};

  if (location) {
    where.location = { equals: location, mode: 'insensitive' };
  }

  if (search) {
    where.caption = { contains: search, mode: 'insensitive' };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lt = new Date(to);
  }

  let orderBy;
  if (sortBy === 'likes') {
    orderBy = [
      { likes: { _count: order } },
      { createdAt: 'desc' },
    ];
  } else {
    orderBy = { [sortBy]: order };
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
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

  return { data, total };
}

async function getPostById(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  return await prisma.post.findUnique({
    where: { id: numericId },
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
  });
}

async function updatePost(id, data) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  const existing = await prisma.post.findUnique({
    where: { id: numericId },
  });
  if (!existing) return null;

  const updateData = {};
  if (data.caption !== undefined) updateData.caption = data.caption;
  if (data.location !== undefined) updateData.location = data.location;

  return await prisma.post.update({
    where: { id: numericId },
    data: updateData,
  });
}

async function deletePost(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  const existing = await prisma.post.findUnique({
    where: { id: numericId },
  });
  if (!existing) return null;

  await prisma.post.delete({
    where: { id: numericId },
  });
  return true;
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
