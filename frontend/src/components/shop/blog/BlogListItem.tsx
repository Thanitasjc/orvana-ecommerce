import Link from "next/link";
import type { BlogPost } from "@/lib/api/blogs";
import { blogHref } from "@/lib/api/blogs";
import { resolveProductImage } from "@/lib/api/products";

const DEFAULT_BLOG_IMAGE = "/assets/img/blog/2/blog-1.jpg";

type BlogListItemProps = {
  post: BlogPost;
};

export function BlogListItem({ post }: BlogListItemProps) {
  const image = resolveProductImage(post.image, DEFAULT_BLOG_IMAGE);

  return (
    <div className="tp-blog-list-item mb-50 d-md-flex">
      <div className="tp-blog-list-thumb p-relative fix">
        <Link href={blogHref(post.slug)}>
          <img src={image} alt={post.title} />
        </Link>
      </div>
      <div className="tp-blog-list-content">
        <h3 className="tp-blog-grid-title">
          <Link href={blogHref(post.slug)}>{post.title}</Link>
        </h3>
        <div className="tp-blog-grid-content">
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

type BlogBreadcrumbProps = {
  title: string;
  parentHref?: string;
  parentLabel?: string;
};

export function BlogBreadcrumb({
  title,
  parentHref = "/blog",
  parentLabel = "Blog",
}: BlogBreadcrumbProps) {
  return (
    <section className="breadcrumb__area include-bg pt-150 pb-150 breadcrumb__overlay">
      <div className="container">
        <div className="row">
          <div className="col-xxl-12">
            <div className="breadcrumb__content text-center p-relative z-index-1">
              <h3 className="breadcrumb__title">{title}</h3>
              <div className="breadcrumb__list">
                <span>
                  <Link href="/">Home</Link>
                </span>
                <span>
                  <Link href={parentHref}>{parentLabel}</Link>
                </span>
                <span>{title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
