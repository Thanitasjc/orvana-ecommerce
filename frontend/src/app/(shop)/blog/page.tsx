import Link from "next/link";
import { BlogBreadcrumb } from "@/components/shop/blog/BlogListItem";
import { BlogListing } from "@/components/shop/blog/BlogListing";
import { fetchBlogs } from "@/lib/api/blogs";

type BlogListPageProps = {
  searchParams: Promise<{ page?: string; search?: string; tag?: string }>;
};

const PER_PAGE = 6;

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const search = params.search?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;

  const response = await fetchBlogs({ page, search, tag, per_page: PER_PAGE });
  const posts = response.data;
  const { current_page, last_page, per_page, total } = response.meta;

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
                    แสดงบทความแท็ก <strong>{tag}</strong> — <Link href="/blog">ดูทั้งหมด</Link>
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-12">
              <BlogListing
                posts={posts}
                currentPage={current_page}
                lastPage={last_page}
                perPage={per_page}
                total={total}
                search={search}
                tag={tag}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
