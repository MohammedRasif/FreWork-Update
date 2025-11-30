"use client";

import { useShowBlogPostQuery } from "@/redux/features/withAuth";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

// Helper: HTML tags remove করে plain text বানাবে + short description
const stripHtmlAndTruncate = (html, wordLimit = 80) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  if (words.length <= wordLimit) return text.trim();
  return words.slice(0, wordLimit).join(" ") + "...";
};

// Helper: Date format → "November 16, 2025"
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function BlogCard({ post }) {
  const [expanded, setExpanded] = useState(false);
 useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const fullText = stripHtmlAndTruncate(
    post.content || post.introductory_description,
    200
  );
  const words = fullText.split(/\s+/).filter((w) => w.length > 0);
  const isLong = words.length > 80;
  const truncated = words.slice(0, 80).join(" ") + (isLong ? "..." : "");

  return (
    <div>
      <NavLink to={`/blog_details/${post.id}`}>
        <article className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="md:w-96 flex-shrink-0">
              <img
                src={
                  post.image ||
                  "https://via.placeholder.com/800x600?text=No+Image"
                }
                alt={post.title}
                className="w-full h-52 md:h-65 object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Content */}
            <div className="flex-1 px-8 md:px-10 lg:px-12 py-6 lg:py-8">
              <div className="space-y-5">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h.01a1 1 0 100-2H6zm2 0a1 1 0 000 2h.01a1 1 0 100-2H8zm2 0a1 1 0 000 2h.01a1 1 0 100-2H10zm2 0a1 1 0 000 2h.01a1 1 0 100-2H12zm-8 4a1 1 0 000 2h.01a1 1 0 100-2H6zm2 0a1 1 0 000 2h.01a1 1 0 100-2H8zm2 0a1 1 0 000 2h.01a1 1 0 100-2H10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{formatDate(post.created_at)}</span>
                </div>

                {/* Description */}
                <p className="text-[15px] text-gray-600 leading-relaxed">
                  {expanded ? fullText : truncated}
                  {isLong && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpanded(!expanded);
                      }}
                      className="ml-2 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                    >
                      {expanded ? "See less" : "Read more"}
                    </button>
                  )}
                </p>

                {/* Continue Reading */}
                <div>
                  <button className="inline-flex items-center gap-2 text-blue-600 font-medium hover:gap-4 transition-all">
                    <span>Continue reading</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </NavLink>
    </div>
  );
}

export default function Blog() {
  const { t } = useTranslation();
  const { data: blogResponse, isLoading, isError } = useShowBlogPostQuery();

  // API থেকে আসা ডাটা
  const blogPosts = blogResponse || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-2xl text-gray-600">Loading blogs...</div>
      </div>
    );
  }

  if (isError || !blogPosts.length) {
    return (
      <div className="text-center py-20 text-gray-500 pt-40 h-screen">
        <p>No blog posts found or something went wrong.</p>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {t("blog_title") || "Our Blog"}
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            {t("blog_description") ||
              "Discover travel stories, tips, and inspiration from real adventurers."}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="space-y-12">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
