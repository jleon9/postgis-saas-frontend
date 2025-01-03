"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAuthStore } from "@/lib/auth/authStore";
import Loading from "@/components/loader/Loading";
import {
  useCreatePost,
  useDeletePost,
  useFindManyPost,
  useUpdatePost,
} from "@/lib/hooks/zenstack/post";

const PostsList = () => {
  const { user } = useAuthStore();
  const params = useParams();
  console.log("PARAMS: ", params);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Query posts for the author
  const {
    data: posts,
    isLoading,
    error,
  } = useFindManyPost({
    where: {
      author: {
        id: params.id as string,
        organization: {
          slug: user?.organization?.slug,
        },
      },
    },
    include: {
      author: true,
      organization: true,
    },
  });

  console.log("POSTS: ", posts);
  console.log("isLoading: ", isLoading);
  console.log("Error: ", error)

  // Mutations
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const handleAddOrEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tags.split(",").map((tag) => tag.trim());

    if (editingPostId) {
      // Update existing post
      await updatePost.mutateAsync({
        where: { id: editingPostId },
        data: {
          title,
          content,
          tags: tagsArray,
        },
      });
      setEditingPostId(null);
    } else {
      // Create new post
      await createPost.mutateAsync({
        data: {
          title,
          content,
          tags: tagsArray,
          author: {
            connect: { id: params.id as string },
          },
          organization: {
            connect: { slug: user?.organization?.slug },
          },
        },
      });
    }

    // Reset form
    setTitle("");
    setContent("");
    setTags("");
  };

  const handleClickEdit = (post: any) => {
    setTitle(post.title);
    setContent(post.content);
    setTags(post.tags.join(", "));
    setEditingPostId(post.id);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle("");
    setContent("");
    setTags("");
  };

  const handleClickDelete = (postId: string) => {
    setDeletingPostId(postId);
  };

  const confirmDelete = async () => {
    if (deletingPostId) {
      await deletePost.mutateAsync({
        where: { id: deletingPostId },
      });
      setDeletingPostId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingPostId(null);
  };

  if (isLoading || !(user?.organization?.slug)) return <Loading />;

  return (
    <main className="m-12">
      {/* Sticky form */}
      <div className="sticky left-0 top-0 z-10 bg-white shadow-md p-6 rounded-lg">
        <h1 className="flex items-center justify-center text-lg font-bold">
          Manage Posts
        </h1>
        <form onSubmit={handleAddOrEditPost} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="title" className="font-medium text-gray-700">
              Title:
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Enter post title"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="content" className="font-medium text-gray-700">
              Content:
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Enter post content"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="tags" className="font-medium text-gray-700">
              Tags (comma-separated):
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Enter tags"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-sky-800 focus:ring-2 focus:ring-zinc-500 focus:outline-none"
          >
            {editingPostId ? "Update Post" : "Add Post"}
          </button>
          {editingPostId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Posts list */}
      <div className="mt-6">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="relative bg-emerald-300 m-2 rounded-md p-2"
          >
            <div className="flex">
              <p className="font-bold pr-1">Title: </p>
              <p className="underline">{post.title}</p>
            </div>
            <div className="flex">
              <p className="font-bold pr-1">Content: </p>
              <p>{post.content}</p>
            </div>
            <div className="flex">
              <p className="font-bold pr-1">Tags: </p>
              <p className="text-blue-700">
                {post.tags
                  .map((tag) => `#${tag.replaceAll(" ", "_")} `)
                  .join("")}
              </p>
            </div>
            <div className="absolute top-0 right-0 flex space-x-2 p-2">
              <FaEdit
                className="text-black cursor-pointer hover:text-blue-700"
                onClick={() => handleClickEdit(post)}
              />
              <FaTrash
                className="text-black cursor-pointer hover:text-red-700"
                onClick={() => handleClickDelete(post.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {deletingPostId && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 space-y-4 w-80">
            <h2 className="text-lg font-bold text-center">Confirm Deletion</h2>
            <p className="text-center text-gray-700">
              Are you sure you want to delete this post?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PostsList;
