// src/hooks/usePosts.js
import { useState, useEffect } from "react";
import seedPosts from "../data/posts";

export default function usePosts() {
  const [posts, setPosts] = useState([]);

  // Load seedPosts + userPosts
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userPosts")) || [];
    setPosts([...seedPosts, ...stored]);
  }, []);

  // Lưu vào localStorage (chỉ lưu userPosts thôi)
  const saveUserPosts = (newPosts) => {
    const onlyUserPosts = newPosts.filter(p => p.isUserPost);
    localStorage.setItem("userPosts", JSON.stringify(onlyUserPosts));
    setPosts([...seedPosts, ...onlyUserPosts]);
  };

  // Thêm post mới
  const addPost = (post) => {
    const newPost = { ...post, id: Date.now(), isUserPost: true };
    saveUserPosts([...posts, newPost]);
  };

  // Xóa post (chỉ cho userPost)
  const deletePost = (id) => {
    const filtered = posts.filter(p => !(p.isUserPost && p.id === id));
    saveUserPosts(filtered);
  };

  return { posts, addPost, deletePost };
}
