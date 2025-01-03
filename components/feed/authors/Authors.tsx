// app/authors/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loading from "@/components/loader/Loading";
import {
  getAuthors,
  addAuthor,
  updateAuthor,
  deleteAuthor,
} from "@/app/actions/author";
import { useAuthStore } from "@/lib/auth/authStore";
import { AuthUser } from "@/types/auth";

export default function Authors() {
  const { user } = useAuthStore();
  console.log("AUTHORS_USER: ", user)

  console.log("Current_User: ", user);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [deletingAuthorId, setDeletingAuthorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorsEffect = async () => {
      await fetchAuthors(user);
    };
    fetchAuthorsEffect();
  }, [user]);

  async function fetchAuthors(user: AuthUser) {
    if (!user) {
      return;
    }
    try {
      const data = await getAuthors(user?.organization?.slug);
      console.log("AUTHORS: ", data);
      setAuthors(data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch authors");
      console.error("Error fetching authors:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);

      if (editingAuthorId) {
        form.append("id", editingAuthorId);
        console.log("FORM_DATA: ", formData)
        await updateAuthor(form, user?.organization.slug);
        setEditingAuthorId(null);
      } else {
        await addAuthor(form, user?.organization.slug);
      }

      // Reset form
      setFormData({ name: "", email: "" });
      await fetchAuthors(user);
    } catch (error) {
      setError(
        editingAuthorId ? "Failed to update author" : "Failed to add author"
      );
      console.error("Error saving author:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleClickEdit(author: Author) {
    setFormData({
      name: author.name,
      email: author.email,
    });
    setEditingAuthorId(author.id);
    setError(null);
  }

  function handleCancelEdit() {
    setEditingAuthorId(null);
    setFormData({ name: "", email: "" });
    setError(null);
  }

  async function handleConfirmDelete() {
    if (!deletingAuthorId) return;

    setLoading(true);
    try {
      await deleteAuthor(deletingAuthorId);
      setDeletingAuthorId(null);
      await fetchAuthors(user);
      setError(null);
    } catch (error) {
      setError("Failed to delete author");
      console.error("Error deleting author:", error);
    } finally {
      setLoading(false);
    }
  }

  if(!user || !user.organization) {
    return <Loading/>
  }

  return (
    <div className="m-12">
      <div className="sticky top-0 z-10 bg-white shadow-md rounded-lg p-6">
        <h1 className="text-lg font-bold text-center mb-6">Authors</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : editingAuthorId
                ? "Update Author"
                : "Add Author"}
            </button>

            {editingAuthorId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading && !authors ? (
        <Loading />
      ) : (
        <div className="mt-6 space-y-4">
          {authors.map((author) => (
            <div key={author.id} className="relative bg-sky-300 rounded-md p-4">
              <Link href={`authors/${author.id}/posts`}>
                <div className="space-y-1">
                  <div className="flex">
                    <span className="font-bold w-20">Name:</span>
                    <span>{author.name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-20">Email:</span>
                    <span>{author.email}</span>
                  </div>
                </div>
              </Link>

              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleClickEdit(author)}
                  className="p-1 hover:text-green-700"
                >
                  <FaEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDeletingAuthorId(author.id)}
                  className="p-1 hover:text-red-700"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAuthorId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 space-y-4">
            <h2 className="text-lg font-bold text-center">Confirm Deletion</h2>
            <p className="text-center text-gray-700">
              Are you sure you want to delete this author?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingAuthorId(null)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
