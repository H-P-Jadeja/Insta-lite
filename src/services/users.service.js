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

async function listUsers() {
  return await prisma.user.findMany();
}

async function getUserById(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;
  return await prisma.user.findUnique({
    where: { id: numericId },
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

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
