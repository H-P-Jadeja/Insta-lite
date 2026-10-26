const prisma = require('../src/db');
const { users, posts, likes } = require('./seed-data');

async function seed() {
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.user.createManyAndReturn({ data: users });

  const userMap = new Map();
  for (const u of createdUsers) {
    userMap.set(u.username, u.id);
  }

  const postsToInsert = posts.map(p => ({
    imageUrl: p.imageUrl,
    caption: p.caption,
    location: p.location,
    authorId: userMap.get(p.author),
    createdAt: p.createdAt,
  }));

  const createdPosts = await prisma.post.createManyAndReturn({ data: postsToInsert });

  const postMap = new Map();
  for (const p of createdPosts) {
    const key = p.imageUrl.split('/')[4];
    postMap.set(key, p.id);
  }

  const likesToInsert = likes.map(l => ({
    userId: userMap.get(l.user),
    postId: postMap.get(l.post),
  }));

  const createdLikes = await prisma.like.createManyAndReturn({ data: likesToInsert });

  console.log(`🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`);
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });