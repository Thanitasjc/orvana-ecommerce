/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { BlogPost } from "@/lib/api/blogs";
import { blogHref, formatBlogDate } from "@/lib/api/blogs";
import { resolveProductImage } from "@/lib/api/products";

type BlogNewsSectionProps = {
  posts?: BlogPost[];
  moreHref?: string;
};

const DEFAULT_BLOG_IMAGE = "/assets/img/blog/2/blog-1.jpg";

const defaultPosts: BlogPost[] = [
  {
    id: 1,
    title: "The 'Boomerang' Employees Returning After Quitting",
    slug: "boomerang-employees",
    image: "/assets/img/blog/2/blog-1.jpg",
    tags: ["Fashion", "Lift Style", "News"],
    author: "AESTHETE Editorial",
    is_published: true,
    published_at: "2023-07-14T00:00:00.000Z",
  },
  {
    id: 2,
    title: "Fast fashion: How clothes are linked to climate change",
    slug: "fast-fashion-climate-change",
    image: "/assets/img/blog/2/blog-2.jpg",
    tags: ["Fashion", "Lift Style", "News"],
    author: "AESTHETE Editorial",
    is_published: true,
    published_at: "2023-05-28T00:00:00.000Z",
  },
  {
    id: 3,
    title: "The Sound Of Fashion: Malcolm McLaren Words",
    slug: "sound-of-fashion",
    image: "/assets/img/blog/2/blog-3.jpg",
    tags: ["Fashion", "Lift Style", "News"],
    author: "AESTHETE Editorial",
    is_published: true,
    published_at: "2023-04-01T00:00:00.000Z",
  },
];

export function BlogNewsSection({ posts = defaultPosts, moreHref = "/blog" }: BlogNewsSectionProps) {
  return (
    <section className="tp-blog-area pt-110 pb-120">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 mb-50 text-center">
              <span className="tp-section-title-pre-2">
                Our Blog &amp; News
                <svg width="82" height="22" viewBox="0 0 82 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M81 14.5798C0.890564 -8.05914 -5.81154 0.0503902 5.00322 21"
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeWidth="2"
                    strokeMiterlimit="3.8637"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <h3 className="tp-section-title-2">Latest News &amp; Articles</h3>
            </div>
          </div>
        </div>

        <div className="row">
          {posts.map((post) => (
            <div key={post.id} className="col-xl-4 col-lg-4 col-md-6">
              <div className="tp-blog-item-2 mb-40">
                <div className="tp-blog-thumb-2 p-relative fix">
                  <Link href={blogHref(post.slug)}>
                    <img
                      src={resolveProductImage(post.image, DEFAULT_BLOG_IMAGE)}
                      alt={post.title}
                    />
                  </Link>
                  <div className="tp-blog-meta-date-2">
                    <span>{formatBlogDate(post.published_at)}</span>
                  </div>
                </div>
                <div className="tp-blog-content-2 has-thumbnail">
                  <div className="tp-blog-meta-2">
                    <span>#</span>
                    {post.tags.map((tag) => (
                      <Link key={`${post.id}-${tag}`} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                        {tag}
                      </Link>
                    ))}
                  </div>
                  <h3 className="tp-blog-title-2">
                    <Link href={blogHref(post.slug)}>{post.title}</Link>
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="tp-blog-more-2 mt-10 text-center">
              <Link href={moreHref} className="tp-btn tp-btn-border tp-btn-border-sm">
                Discover More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
