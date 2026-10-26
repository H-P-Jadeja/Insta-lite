const prisma = require('../db');

async function getPostLikes(postId) {
  const numericId = Number(postId);
  if (isNaN(numericId)) return { notFound: true };

  const post = await prisma.post.findUnique({
    where: { id: numericId },
    select: {
      id: true,
      likes: {
        orderBy: {
          user: {
            username: 'asc',
          },
        },
        select: {
          user: {
            select: {
              id: true,
              username: true,
              fullname: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    return { notFound: true };
  }

  return { users: post.likes.map(l => l.user) };
}

async function addLike(postId, userId) {
  const numericPostId = Number(postId);
  const numericUserId = Number(userId);

  if (isNaN(numericPostId)) return { postNotFound: true };
  if (isNaN(numericUserId)) return { userNotFound: true };

  const post = await prisma.post.findUnique({
    where: { id: numericPostId },
  });
  if (!post) return { postNotFound: true };

  const user = await prisma.user.findUnique({
    where: { id: numericUserId },
  });
  if (!user) return { userNotFound: true };

  try {
    const like = await prisma.like.create({
      data: {
        postId: numericPostId,
        userId: numericUserId,
      },
    });
    return { like };
  } catch (error) {
    if (error.code === 'P2002' || (error.message && error.message.includes('Unique constraint'))) {
      return { alreadyLiked: true };
    }
    throw error;
  }
}

async function removeLike(postId, userId) {
  const numericPostId = Number(postId);
  const numericUserId = Number(userId);

  if (isNaN(numericPostId) || isNaN(numericUserId)) {
    return { notFound: true };
  }

  try {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: numericUserId,
          postId: numericPostId,
        },
      },
    });
    return { success: true };
  } catch (error) {
    if (error.code === 'P2025' || (error.message && error.message.includes('Record to delete does not exist'))) {
      return { notFound: true };
    }
    throw error;
  }
}

module.exports = {
  getPostLikes,
  addLike,
  removeLike,
};
