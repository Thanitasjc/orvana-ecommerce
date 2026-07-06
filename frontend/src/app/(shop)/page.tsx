import Link from "next/link";
import { HeroBanner } from "@/components/shop/home/HeroBanner";
import { PromoBanners } from "@/components/shop/home/PromoBanners";
import { CategorySlider } from "@/components/shop/home/CategorySlider";
import { ProductTabsSection } from "@/components/shop/home/ProductTabsSection";
import { FeaturedProductSlider } from "@/components/shop/home/FeaturedProductSlider";
import { TrendingArrivalsSection } from "@/components/shop/home/TrendingArrivalsSection";
import { BlogNewsSection } from "@/components/shop/home/BlogNewsSection";
import { BestSellerSection } from "@/components/shop/home/BestSellerSection";
import { fetchBlogs } from "@/lib/api/blogs";
import {
  fetchHomepageCms,
  mapHeroSlidesForBanner,
  pickCuratedProducts,
} from "@/lib/api/cms";
import {
  getProducts,
  resolveProductImage,
  defaultProductImageForId,
  mapToBestSellerItems,
  mapToCategorySliderItems,
  mapToFeaturedSliderItems,
  mapToProductTabsItems,
  mapToTrendingItems,
  productHref,
} from "@/lib/api/products";

export default async function HomePage() {
  const [allProducts, featuredProducts, cms, blogsRes] = await Promise.all([
    getProducts(),
    getProducts({ featured: true }),
    fetchHomepageCms(),
    fetchBlogs({ per_page: 3 }),
  ]);

  const heroSlides = mapHeroSlidesForBanner(cms.heroSlides);
  const curatedFavorite = pickCuratedProducts(allProducts, cms.customerFavorite);
  const curatedFeatured = pickCuratedProducts(allProducts, cms.featuredProducts);

  const categoryItems = allProducts.length > 0 ? mapToCategorySliderItems(allProducts) : undefined;
  const tabProducts =
    curatedFavorite && curatedFavorite.length > 0
      ? mapToProductTabsItems(curatedFavorite)
      : allProducts.length > 0
        ? mapToProductTabsItems(allProducts)
        : undefined;
  const featuredSliderProducts =
    curatedFeatured && curatedFeatured.length > 0 ? curatedFeatured : featuredProducts;
  const featuredSliderItems =
    featuredSliderProducts.length > 0 ? mapToFeaturedSliderItems(featuredSliderProducts) : undefined;
  const gridFeaturedProducts =
    curatedFeatured && curatedFeatured.length > 0 ? curatedFeatured : featuredProducts;
  const trendingItems = allProducts.length > 0 ? mapToTrendingItems(allProducts) : undefined;
  const bestSellerItems = allProducts.length > 0 ? mapToBestSellerItems(allProducts) : undefined;

  return (
    <>
      <HeroBanner slides={heroSlides} />
      <PromoBanners />
      <CategorySlider items={categoryItems} />
      <ProductTabsSection
        products={tabProducts}
        sectionTitle={cms.customerFavorite.enabled ? cms.customerFavorite.title : undefined}
      />
      <FeaturedProductSlider
        items={featuredSliderItems}
        sectionTitle={cms.featuredProducts.enabled ? cms.featuredProducts.title : undefined}
      />
      <TrendingArrivalsSection items={trendingItems} />
      <BestSellerSection items={bestSellerItems} />
      <BlogNewsSection posts={blogsRes.data} />

      <section className="tp-product-area pt-80 pb-65">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-section-title-wrapper-2 text-center mb-50">
                <span className="tp-section-title-pre-2">สินค้าแนะนำ</span>
                <h3 className="tp-section-title-2">
                  {cms.featuredProducts.enabled ? cms.featuredProducts.title : "Featured Products"}
                </h3>
              </div>
            </div>
          </div>
          <div className="row">
            {gridFeaturedProducts.length === 0 ? (
              <div className="col-12 text-center">
                <p>กำลังโหลดสินค้า — ตรวจสอบว่า Laravel API ทำงานที่ port 8000</p>
              </div>
            ) : (
              gridFeaturedProducts.map((product) => (
                <div key={product.id} className="col-xl-3 col-lg-3 col-md-4 col-sm-6">
                  <div className="tp-product-item-2 mb-40">
                    <div className="tp-product-thumb-2 p-relative fix">
                      <Link href={productHref(product.slug)}>
                        <img
                          src={resolveProductImage(product.image, defaultProductImageForId(product.id))}
                          alt={product.name}
                        />
                      </Link>
                    </div>
                    <div className="tp-product-content-2">
                      <h4 className="tp-product-title-2">
                        <Link href={productHref(product.slug)}>{product.name}</Link>
                      </h4>
                      <div className="tp-product-price-wrapper-2">
                        <span className="tp-product-price-2">
                          ฿{product.price.toLocaleString("th-TH")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
