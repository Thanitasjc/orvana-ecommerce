import Link from "next/link";
import { BlogBreadcrumb, BlogListItem } from "@/components/shop/blog/BlogListItem";
import { fetchBlogs } from "@/lib/api/blogs";

type BlogListPageProps = {
  searchParams: Promise<{ page?: string; search?: string; tag?: string }>;
};

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const search = params.search?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;

  const response = await fetchBlogs({ page, search, tag, per_page: 6 });
  const posts = response.data;
  const { current_page, last_page, total } = response.meta;

  return (
    <>
      <BlogBreadcrumb title={tag ? `Tag: ${tag}` : "Our Blog"} />

      <section className="tp-blog-area pt-100 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-section-title-wrapper-2 mb-50 text-center">
                <span className="tp-section-title-pre-2">Our Blog &amp; News</span>
                <h3 className="tp-section-title-2">Latest News &amp; Articles</h3>
                {tag ? (
                  <p className="mt-2 text-muted">
                    แสดงบทความแท็ก <strong>{tag}</strong> —{" "}
                    <Link href="/blog">ดูทั้งหมด</Link>
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-12">
              {posts.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center text-muted">
                  ยังไม่มีบทความ
                </div>
              ) : (
                posts.map((post) => <BlogListItem key={post.id} post={post} />)
              )}
            </div>
          </div>

          {last_page > 1 ? (
            <div className="row">
              <div className="col-xl-12">
                <div className="tp-pagination mt-20 d-flex justify-content-center gap-3">
                  {current_page > 1 ? (
                    <Link
                      href={`/blog?page=${current_page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                      className="tp-btn tp-btn-border tp-btn-border-sm"
                    >
                      Previous
                    </Link>
                  ) : null}
                  <span className="align-self-center text-muted">
                    หน้า {current_page} / {last_page} ({total} บทความ)
                  </span>
                  {current_page < last_page ? (
                    <Link
                      href={`/blog?page=${current_page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                      className="tp-btn tp-btn-border tp-btn-border-sm"
                    >
                      Next
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
