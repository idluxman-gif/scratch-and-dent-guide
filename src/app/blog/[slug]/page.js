import Link from "next/link";
import PageNav from "@/components/PageNav";
import { blogArticles } from "../blogData";
import { articleContent } from "../articleContent";

export function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }) {
  const article = blogArticles.find((a) => a.slug === params.slug);
  if (!article) return {};
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: article.keywords,
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: "article",
      publishedTime: article.publishDate,
      url: `https://www.scratchanddentguide.com/blog/${article.slug}`,
    },
  };
}

export default function BlogArticlePage({ params }) {
  const article = blogArticles.find((a) => a.slug === params.slug);
  if (!article) return <div>Article not found</div>;

  const content = articleContent[article.slug] || "";
  const publishFormatted = new Date(article.publishDate).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishDate,
    dateModified: article.publishDate,
    author: { "@type": "Organization", name: "ScratchAndDentGuide.com" },
    publisher: {
      "@type": "Organization",
      name: "ScratchAndDentGuide.com",
      url: "https://www.scratchanddentguide.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.scratchanddentguide.com/blog/${article.slug}`,
    },
  };

  const ps = { fontSize: 15, color: "#374151", lineHeight: 1.8, margin: "0 0 18px" };
  const hs = { fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "32px 0 12px", lineHeight: 1.3 };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageNav />

      <article style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 48px" }}>
        <nav style={{ marginBottom: 20, fontSize: 12, color: "#94A3B8" }}>
          <Link href="/" style={{ color: "#94A3B8", textDecoration: "none" }}>Home</Link>
          {" / "}
          <Link href="/blog" style={{ color: "#94A3B8", textDecoration: "none" }}>Blog</Link>
          {" / "}
          <span style={{ color: "#64748B" }}>{article.title.substring(0, 40)}...</span>
        </nav>

        <time style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{publishFormatted}</time>
        <h1 style={{ margin: "8px 0 24px", fontSize: "clamp(24px,4vw,32px)", fontWeight: 900, color: "#0F172A", lineHeight: 1.2 }}>
          {article.title}
        </h1>

        <div
          style={{ fontSize: 15, color: "#374151", lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* CTA Section */}
        <div style={{
          marginTop: 40, padding: 28, background: "linear-gradient(135deg,#0F172A,#1E293B)",
          borderRadius: 14, textAlign: "center",
        }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#fff" }}>
            Find Scratch & Dent Stores Near You
          </h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", margin: "0 0 16px" }}>
            Browse our directory of 685+ verified stores across 48 states.
          </p>
          <Link href="/" style={{
            display: "inline-block", padding: "12px 28px", background: "#10B981",
            color: "#fff", borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}>
            Browse Directory &rarr;
          </Link>
        </div>
      </article>
    </div>
  );
}
