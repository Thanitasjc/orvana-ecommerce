import Link from "next/link";

type BlogPost = {
  id: string;
  title: string;
  image: string;
  date: string;
  href: string;
  tags: string[];
};

type BlogNewsSectionProps = {
  posts?: BlogPost[];
  moreHref?: string;
};

const defaultPosts: BlogPost[] = [
  {
    id: "b-1",
    title: "The 'Boomerang' Employees Returning After Quitting",
    image: "/assets/img/blog/2/blog-1.jpg",
    date: "14 July, 2023",
    href: "/blog/boomerang-employees",
    tags: ["Fashion", "Lift Style", "News"],
  },
  {
    id: "b-2",
    title: "Fast fashion: How clothes are linked to climate change",
    image: "/assets/img/blog/2/blog-2.jpg",
    date: "28 May, 2023",
    href: "/blog/fast-fashion-climate-change",
    tags: ["Fashion", "Lift Style", "News"],
  },
  {
    id: "b-3",
    title: "The Sound Of Fashion: Malcolm McLaren Words",
    image: "/assets/img/blog/2/blog-3.jpg",
    date: "01 April, 2023",
    href: "/blog/sound-of-fashion",
    tags: ["Fashion", "Lift Style", "News"],
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
                <svg
                  width="82"
                  height="22"
                  viewBox="0 0 82 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                  <Link href={post.href}>
                    <img src={post.image} alt={post.title} />
                  </Link>
                  <div className="tp-blog-meta-date-2">
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className="tp-blog-content-2 has-thumbnail">
                  <div className="tp-blog-meta-2">
                    <span>#</span>
                    {post.tags.map((tag) => (
                      <Link key={`${post.id}-${tag}`} href="/blog">
                        {tag}
                      </Link>
                    ))}
                  </div>
                  <h3 className="tp-blog-title-2">
                    <Link href={post.href}>{post.title}</Link>
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

