import Link from "next/link";

type PromoBanner = {
  image: string;
  title: string;
  href: string;
};

type PromoBannersProps = {
  items?: PromoBanner[];
};

const defaultItems: PromoBanner[] = [
  {
    image: "/assets/img/banner/2/banner-1.jpg",
    title: "T-Shirt Tunic <br/> Tops Blouse",
    href: "/shop",
  },
  {
    image: "/assets/img/banner/2/banner-2.jpg",
    title: "Satchel Tote <br/> Crossbody Bags",
    href: "/shop",
  },
  {
    image: "/assets/img/banner/2/banner-3.jpg",
    title: "Men's Tennis <br/> Walking Shoes",
    href: "/shop",
  },
];

export function PromoBanners({ items = defaultItems }: PromoBannersProps) {
  return (
    <section className="tp-banner-area mt-20">
      <div className="container-fluid tp-gx-40">
        <div className="row tp-gx-20">
          {items.map((item, index) => (
            <div className="col-xxl-4 col-lg-6" key={index}>
              <div className="tp-banner-item-2 p-relative z-index-1 grey-bg-2 mb-20 fix">
                <div
                  className="tp-banner-thumb-2 include-bg transition-3"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <h3
                  className="tp-banner-title-2"
                  dangerouslySetInnerHTML={{
                    __html: `<a href="${item.href}">${item.title}</a>`,
                  }}
                />
                <div className="tp-banner-btn-2">
                  <Link href={item.href} className="tp-btn tp-btn-border tp-btn-border-sm">
                    Shop Now
                    <svg
                      width="17"
                      height="15"
                      viewBox="0 0 17 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16 7.49988L1 7.49988"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.9502 1.47554L16.0002 7.49954L9.9502 13.5245"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

