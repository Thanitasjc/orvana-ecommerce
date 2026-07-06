import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBreadcrumb } from "@/components/shop/blog/BlogListItem";
import { fetchBlogBySlug, fetchBlogs, formatBlogDate } from "@/lib/api/blogs";
import { resolveProductImage } from "@/lib/api/products";

const DEFAULT_BLOG_IMAGE = "/assets/img/blog/details/blog-big-1.jpg";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await fetchBlogBySlug(slug);
  } catch {
    notFound();
  }

  const image = resolveProductImage(post.image, DEFAULT_BLOG_IMAGE);
  const recentRes = await fetchBlogs({ per_page: 4 });
  const recentPosts = recentRes.data.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <>
      <BlogBreadcrumb title={post.title} />

      <section className="tp-postbox-area pt-100 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-lg-8">
              <article className="tp-postbox-item">
                <div className="tp-postbox-thumb mb-30">
                  <img src={image} alt={post.title} className="w-100" />
                </div>
                <div className="tp-postbox-content">
                  <div className="tp-postbox-meta">
                    <span>
                      <i className="fa-regular fa-user" /> {post.author}
                    </span>
                    <span>
                      <i className="fa-regular fa-calendar" /> {formatBlogDate(post.published_at)}
                    </span>
                  </div>
                  <h1 className="tp-postbox-title">{post.title}</h1>
                  {post.tags.length > 0 ? (
                    <div className="tp-blog-tag mb-20">
                      <span>#</span>
                      {post.tags.map((tag) => (
                        <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                          {tag}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  <div
                    className="tp-postbox-text"
                    dangerouslySetInnerHTML={{ __html: post.content ?? post.excerpt ?? "" }}
                  />
                </div>
              </article>
            </div>

            <div className="col-xl-4 col-lg-4">
              <div className="tp-sidebar-wrapper tp-sidebar-sticky">
                <div className="tp-sidebar-widget mb-45">
                  <h3 className="tp-sidebar-widget-title">Recent Posts</h3>
                  <div className="tp-sidebar-widget-content">
                    <div className="tp-sidebar-rc-post">
                      <ul>
                        {recentPosts.map((recent) => (
                          <li key={recent.id}>
                            <div className="rc-post d-flex align-items-center">
                              <div className="rc-post-thumb">
                                <Link href={`/blog/${recent.slug}`}>
                                  <img
                                    src={resolveProductImage(recent.image, DEFAULT_BLOG_IMAGE)}
                                    alt={recent.title}
                                  />
                                </Link>
                              </div>
                              <div className="rc-post-content">
                                <h3 className="rc-post-title">
                                  <Link href={`/blog/${recent.slug}`}>{recent.title}</Link>
                                </h3>
                                <span>{formatBlogDate(recent.published_at)}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
