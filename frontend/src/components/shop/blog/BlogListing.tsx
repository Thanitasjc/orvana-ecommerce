"use client";

import Link from "next/link";
import { useState } from "react";
import type { BlogPost } from "@/lib/api/blogs";
import { BlogGridItem } from "@/components/shop/blog/BlogGridItem";
import { BlogListItem } from "@/components/shop/blog/BlogListItem";

type BlogViewMode = "grid" | "list";

type BlogListingProps = {
  posts: BlogPost[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  search?: string;
  tag?: string;
};

function buildPageHref(page: number, search?: string, tag?: string) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  if (search) query.set("search", search);
  if (tag) query.set("tag", tag);
  return `/blog?${query.toString()}`;
}

function resultRange(currentPage: number, perPage: number, total: number) {
  if (total === 0) {
    return { start: 0, end: 0 };
  }

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);
  return { start, end };
}

export function BlogListing({
  posts,
  currentPage,
  lastPage,
  perPage,
  total,
  search,
  tag,
}: BlogListingProps) {
  const [view, setView] = useState<BlogViewMode>("grid");
  const { start, end } = resultRange(currentPage, perPage, total);

  return (
    <>
      <div className="tp-blog-grid-top d-flex justify-content-between mb-40">
        <div className="tp-blog-grid-result">
          <p>
            Showing {start}–{end} of {total} results
          </p>
        </div>
        <div className="tp-blog-grid-tab tp-tab">
          <nav>
            <div className="nav nav-tabs" id="nav-tab" role="tablist">
              <button
                className={`nav-link ${view === "grid" ? "active" : ""}`}
                id="nav-grid-tab"
                type="button"
                role="tab"
                aria-controls="nav-grid"
                aria-selected={view === "grid"}
                onClick={() => setView("grid")}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16.3328 6.01317V2.9865C16.3328 2.0465 15.9061 1.6665 14.8461 1.6665H12.1528C11.0928 1.6665 10.6661 2.0465 10.6661 2.9865V6.0065C10.6661 6.95317 11.0928 7.3265 12.1528 7.3265H14.8461C15.9061 7.33317 16.3328 6.95317 16.3328 6.01317Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.3328 15.18V12.4867C16.3328 11.4267 15.9061 11 14.8461 11H12.1528C11.0928 11 10.6661 11.4267 10.6661 12.4867V15.18C10.6661 16.24 11.0928 16.6667 12.1528 16.6667H14.8461C15.9061 16.6667 16.3328 16.24 16.3328 15.18Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.33281 6.01317V2.9865C7.33281 2.0465 6.90614 1.6665 5.84614 1.6665H3.1528C2.0928 1.6665 1.66614 2.0465 1.66614 2.9865V6.0065C1.66614 6.95317 2.0928 7.3265 3.1528 7.3265H5.84614C6.90614 7.33317 7.33281 6.95317 7.33281 6.01317Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.33281 15.18V12.4867C7.33281 11.4267 6.90614 11 5.84614 11H3.1528C2.0928 11 1.66614 11.4267 1.66614 12.4867V15.18C1.66614 16.24 2.0928 16.6667 3.1528 16.6667H5.84614C6.90614 16.6667 7.33281 16.24 7.33281 15.18Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                className={`nav-link ${view === "list" ? "active" : ""}`}
                id="nav-list-tab"
                type="button"
                role="tab"
                aria-controls="nav-list"
                aria-selected={view === "list"}
                onClick={() => setView("list")}
              >
                <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 7.11133H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 1H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 13.2222H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted">ยังไม่มีบทความ</div>
      ) : view === "grid" ? (
        <div className="row tp-blog-grid-wrapper">
          {posts.map((post) => (
            <BlogGridItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <BlogListItem key={post.id} post={post} />
          ))}
        </div>
      )}

      {lastPage > 1 ? (
        <div className="tp-pagination mt-20 d-flex justify-content-center gap-3">
          {currentPage > 1 ? (
            <Link href={buildPageHref(currentPage - 1, search, tag)} className="tp-btn tp-btn-border tp-btn-border-sm">
              Previous
            </Link>
          ) : null}
          <span className="align-self-center text-muted">
            หน้า {currentPage} / {lastPage}
          </span>
          {currentPage < lastPage ? (
            <Link href={buildPageHref(currentPage + 1, search, tag)} className="tp-btn tp-btn-border tp-btn-border-sm">
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
