import { useEffect, useId, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowUpRight, BookOpen, CalendarDays, Compass, Loader2, RotateCcw } from "lucide-react";
import { useShowBlogPostQuery } from "@/redux/features/withAuth";

const stripHtmlAndTruncate = (html, wordLimit = 200) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll("br, p, div, li, h1, h2, h3, h4, h5, h6, blockquote").forEach((element) => {
    element.after(document.createTextNode(" "));
  });
  const words = (div.textContent || "").trim().split(/\s+/).filter(Boolean);
  return words.slice(0, wordLimit).join(" ") + (words.length > wordLimit ? "…" : "");
};

function BlogImage({ post, featured }) {
  const [failed, setFailed] = useState(false);

  return (
    <NavLink
      to={`/blog/${post.slug}`}
      aria-label={post.title}
      className={`group relative block shrink-0 overflow-hidden bg-[#29465e] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#e4b154] ${featured ? "aspect-[16/10] lg:aspect-auto lg:min-h-[340px]" : "aspect-[16/10]"}`}
    >
      {post.image && !failed ? (
        <img
          src={post.image}
          alt=""
          loading={featured ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#25445e] to-[#8ca5ae] text-white/55">
          <Compass size={featured ? 84 : 64} strokeWidth={1.1} aria-hidden="true" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#10243a]/20 to-transparent" />
    </NavLink>
  );
}

function BlogCard({ post, featured = false }) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const excerptId = useId();
  const fullText = stripHtmlAndTruncate(post.content || post.introductory_description);
  const words = fullText.split(/\s+/).filter(Boolean);
  const wordLimit = featured ? 50 : 30;
  const isLong = words.length > wordLimit;
  const excerpt = expanded ? fullText : words.slice(0, wordLimit).join(" ") + (isLong ? "…" : "");
  const date = post.created_at ? new Date(post.created_at) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  const formattedDate = validDate
    ? new Intl.DateTimeFormat(i18n.language.startsWith("ru") ? "ru-RU" : "ro-RO", { day: "numeric", month: "short", year: "numeric" }).format(date)
    : t("date_unavailable");
  const Title = featured ? "h2" : "h3";

  return (
    <article className={`min-w-0 overflow-hidden rounded-[24px] border border-[#e9e6e0] bg-white shadow-[0_12px_36px_rgba(23,43,67,0.06)] ${featured ? "lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" : "flex h-full flex-col"}`}>
      <BlogImage key={post.image || "no-image"} post={post} featured={featured} />
      <div className={`flex min-w-0 flex-1 flex-col ${featured ? "p-6 sm:p-8 lg:p-10" : "p-6 sm:p-7"}`}>
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#718092] sm:text-sm">
          <CalendarDays size={16} className="shrink-0 text-[#b98427]" aria-hidden="true" />
          {validDate ? <time dateTime={date.toISOString()}>{formattedDate}</time> : <span>{formattedDate}</span>}
        </div>
        <Title className={`break-words font-bold leading-tight tracking-tight text-[#172b43] ${featured ? "text-2xl sm:text-3xl lg:text-[34px]" : "text-xl sm:text-2xl"}`}>
          <NavLink to={`/blog/${post.slug}`} className="rounded-sm transition-colors hover:text-[#9d6b1e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c88f2a]">{post.title}</NavLink>
        </Title>
        {fullText && (
          <div className="mt-4">
            <p id={excerptId} className="break-words text-sm leading-7 text-[#617082] sm:text-base">{excerpt}</p>
            {isLong && (
              <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls={excerptId} className="mt-1 inline-flex min-h-9 items-center rounded-sm text-sm font-semibold text-[#9d6b1e] underline decoration-[#d6a044]/50 underline-offset-4 hover:text-[#755018] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c88f2a]">
                {expanded ? t("show_less") : t("read_more")}
              </button>
            )}
          </div>
        )}
        <div className="mt-auto pt-6">
          <NavLink to={`/blog/${post.slug}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8e0e6] px-4 py-2 text-sm font-bold text-[#243b50] transition-colors hover:border-[#d6a044] hover:bg-[#fff8ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c88f2a]">
            {t("continue_reading")} <ArrowUpRight size={17} aria-hidden="true" />
          </NavLink>
        </div>
      </div>
    </article>
  );
}

export default function Blog() {
  const { t } = useTranslation();
  const { data: blogResponse, isLoading, isError, refetch } = useShowBlogPostQuery();
  const blogPosts = Array.isArray(blogResponse) ? blogResponse : Array.isArray(blogResponse?.results) ? blogResponse.results : [];
  const [featuredPost, ...remainingPosts] = blogPosts;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="blog-page min-h-screen bg-[#faf9f6] pt-[72px] text-[#172b43] xl:pt-[82px]">
      <header className="bg-[#172b43] pb-24 pt-12 text-white sm:pb-28 sm:pt-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" />
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#e8b75b]">TreiOferte</p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("blog_title")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{t("blog_description")}</p>
        </div>
      </header>

      <div className="relative mx-auto -mt-10 max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        {isLoading || isError || !featuredPost ? (
          <section role={isError ? "alert" : "status"} aria-live="polite" className="flex min-h-72 flex-col items-center justify-center rounded-[24px] border border-[#e9e6e0] bg-white px-6 py-12 text-center shadow-[0_12px_36px_rgba(23,43,67,0.06)] sm:px-10">
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#b98427]">
              {isLoading ? <Loader2 size={26} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : isError ? <AlertCircle size={26} aria-hidden="true" /> : <BookOpen size={26} aria-hidden="true" />}
            </span>
            <h2 className="max-w-xl text-xl font-bold leading-snug sm:text-2xl">{isLoading ? t("loading_blogs") : isError ? t("blog_page.error_title") : t("blog_page.empty_title")}</h2>
            {!isLoading && <p className="mt-3 max-w-lg text-sm leading-6 text-[#617082] sm:text-base">{isError ? t("blog_fetch_error") : t("blog_page.empty_description")}</p>}
            {isError && <button type="button" onClick={refetch} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-5 py-2 text-sm font-bold text-white hover:bg-[#ad751c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9e6c20]"><RotateCcw size={17} aria-hidden="true" />{t("try_again")}</button>}
          </section>
        ) : (
          <>
            <BlogCard key={featuredPost.slug} post={featuredPost} featured />
            {remainingPosts.length > 0 && (
              <section aria-labelledby="blog-articles-title" className="mt-12 sm:mt-16">
                <div className="mb-7 sm:mb-8"><div className="mb-4 h-1 w-10 rounded-full bg-[#d6a044]" /><h2 id="blog-articles-title" className="text-2xl font-bold tracking-tight sm:text-3xl">{t("blog_page.articles_title")}</h2></div>
                <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {remainingPosts.map((post) => <BlogCard key={post.slug} post={post} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
