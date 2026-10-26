const prisma = require('../db');

async function createPost(data) {
  return await prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      caption: data.caption !== undefined ? data.caption : null,
      location: data.location !== undefined ? data.location : null,
    },
  });
}

async function listPosts() {
  return await prisma.post.findMany();
}

async function getPostById(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;
  return await prisma.post.findUnique({
    where: { id: numericId },
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
