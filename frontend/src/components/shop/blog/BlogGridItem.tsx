/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { BlogPost } from "@/lib/api/blogs";
import { blogHref, formatBlogDate } from "@/lib/api/blogs";
import { resolveProductImage } from "@/lib/api/products";

const DEFAULT_BLOG_IMAGE = "/assets/img/blog/2/blog-1.jpg";

type BlogGridItemProps = {
  post: BlogPost;
};

export function BlogGridItem({ post }: BlogGridItemProps) {
  const image = resolveProductImage(post.image, DEFAULT_BLOG_IMAGE);

  return (
    <div className="col-xl-4 col-lg-4 col-md-6">
      <div className="tp-blog-grid-item mb-40">
        <div className="tp-blog-grid-thumb p-relative fix">
          <Link href={blogHref(post.slug)}>
            <img src={image} alt={post.title} />
          </Link>
          <div className="tp-blog-meta-date">
            <span>{formatBlogDate(post.published_at)}</span>
          </div>
        </div>
        <div className="tp-blog-grid-content">
          <div className="tp-blog-grid-meta">
            <span>
              <i className="fa-regular fa-user" /> {post.author}
            </span>
          </div>
          <h3 className="tp-blog-grid-title">
            <Link href={blogHref(post.slug)}>{post.title}</Link>
          </h3>
          {post.excerpt ? <p>{post.excerpt}</p> : null}
          <div className="tp-blog-grid-btn">
            <Link href={blogHref(post.slug)} className="tp-btn tp-btn-border">
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
