"use client";

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useShowBlogPostQuery } from "@/redux/features/withAuth";
import { format } from "date-fns";
import { ro, ru } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n.js";


const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "PPP", { locale: i18n.language === "ro" ? ro : ru });
  } catch (error) {
    return i18n.t("date_unavailable");
  }
};

export default function BlogDetails() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  console.log("URL param (slug):", slug);
  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useShowBlogPostQuery();

  const post = posts.find((p) => p.slug === slug);

  useEffect(() => {
    document.title = `TreiOferte | ${post?.title || t("blog")}`;
  }, [post?.title, t, i18n.language]);

  console.log("Total posts loaded:", posts.length);
  console.log("Found post:", post ? post.title : "Not found");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">{t("loading_blog_post")}</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center h-screen">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          {t("error_loading_post")}
        </h1>
        <p className="text-gray-600">
          {error?.data?.message ||
            t("blog_fetch_error")}
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center h-screen">
        <h1 className="text-4xl font-bold text-red-600 mb-4">{t("post_not_found")}</h1>
        <p className="text-gray-600">
          {t("post_slug_not_found")} <strong>{slug}</strong>
          <br />
          {t("check_post_url")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans pt-24 ">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-gray-600 mt-4">
          {formatDate(post.created_at)}
        </p>
      </div>

      {post.image && (
        <div className="mb-12 -mx-4 md:mx-0">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-72 md:h-96 object-cover rounded-xl shadow-2xl"
          />
        </div>
      )}

      <article className="blog-content-raw mt-10 prose prose-lg max-w-none">
        {post.content ? (
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p className="text-gray-500 italic">
            {post.introductory_description || t("no_content")}
          </p>
        )}
      </article>

      {post.author && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>{t("written_by")}</strong> {post.author}
          </p>
        </div>
      )}
    </div>
  );
}
