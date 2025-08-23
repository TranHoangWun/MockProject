// src/utils/storage.js
export function savePostsToStorage(posts) {
  const lightweightPosts = posts.map((p) => ({
    ...p,
    images: p.images ? p.images.map(() => null) : [],
    author: {
      ...p.author,
      avatar:
        p.author?.avatar && p.author.avatar.startsWith("data:")
          ? null
          : p.author?.avatar,
    },
    comments: p.comments?.map((c) => ({
      ...c,
      user: {
        ...c.user,
        avatar:
          c.user?.avatar && c.user.avatar.startsWith("data:")
            ? null
            : c.user?.avatar,
      },
    })),
  }));

  localStorage.setItem("posts", JSON.stringify(lightweightPosts));
}
