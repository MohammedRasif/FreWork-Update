"use client";

import React from "react";
import { useParams } from "react-router-dom"; 
import { useShowBlogPostQuery } from "@/redux/features/withAuth";
import { format } from "date-fns";

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "MMMM d, yyyy");
  } catch (error) {
    return "Date not available";
  }
};

export default function BlogDetails() {
  const { id } = useParams(); 
  const numericId = id ? parseInt(id, 10) : null; 

  const {
    data: postsArray = [], 
    isLoading,
    isError,
    error,
  } = useShowBlogPostQuery(numericId, {
    skip: !numericId,
  });

  const post = postsArray.find(p => p.id === numericId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading blog post...</div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Post Not Found</h1>
        <p className="text-gray-600">
          {error?.data?.message || "The blog post you're looking for doesn't exist."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans pt-24">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-[40px] font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>
        <p className="text-[16px] text-gray-600 mt-4">
          {formatDate(post.created_at)}
        </p>
      </div>

      {post.image && (
        <div className="mb-12 -mx-4 md:mx-0">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-72 md:h-[400px] object-cover rounded-xl shadow-2xl"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
        {post.content ? (
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="blog-content"
          />
        ) : (
          <p className="text-gray-500 italic">
            {post.introductory_description || "No content available."}
          </p>
        )}
      </div>

      {post.author && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Written by:</strong> {post.author}
          </p>
        </div>
      )}
    </div>
  );
}