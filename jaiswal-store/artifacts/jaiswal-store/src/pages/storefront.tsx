import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Tag, TrendingDown } from "lucide-react";
import { StoreLayout } from "@/components/store-layout";
import {
  useListProducts,
  getListProductsQueryKey,
  useGetShopSettings,
  getGetShopSettingsQueryKey,
  useGetProductStats,
  getGetProductStatsQueryKey,
} from "@workspace/api-client-react";

function ProductCard({ product, index }: { product: any; index: number }) {
  const hasDiscount = product.discount > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="group bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/30" />
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full">
            ₹{product.discount} OFF
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm leading-snug mb-3 line-clamp-2">
          {product.name}
        </h3>
        <div className="space-y-1">
          {hasDiscount ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  ₹{product.finalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-green-600 font-medium">
                You save ₹{product.savings.toFixed(2)}
              </p>
            </>
          ) : (
            <span className="text-xl font-bold text-primary">
              ₹{product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Storefront() {
  const { data: products, isLoading: productsLoading } = useListProducts({
    query: { queryKey: getListProductsQueryKey() },
  });
  const { data: shop } = useGetShopSettings({
    query: { queryKey: getGetShopSettingsQueryKey() },
  });
  const { data: stats } = useGetProductStats({
    query: { queryKey: getGetProductStatsQueryKey() },
  });

  return (
    <StoreLayout>
      {/* Hero */}
      <section className="relative bg-secondary text-secondary-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, hsl(28,90%,55%) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(43,100%,50%) 0%, transparent 50%)",
          }}
        />
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-primary/20 border border-primary/30 text-primary text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
              Fresh Prices, Updated Daily
            </span>
            <h1 className="font-extrabold text-4xl md:text-6xl leading-tight mb-4">
              {shop?.name || "Jaiswal Store"}
            </h1>
            <p className="text-secondary-foreground/70 text-lg max-w-lg mx-auto">
              Your trusted neighborhood general store — honest prices, daily
              essentials, community roots.
            </p>
          </motion.div>

          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex flex-wrap justify-center gap-6"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  {stats.totalProducts} Products
                </span>
              </div>
              {stats.onDiscount > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl">
                  <Tag className="h-5 w-5 text-primary" />
                  <span className="font-semibold">
                    {stats.onDiscount} On Sale
                  </span>
                </div>
              )}
              {stats.lowestPrice != null && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  <span className="font-semibold">
                    From ₹{stats.lowestPrice.toFixed(0)}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Our Products</h2>
          <p className="text-muted-foreground mt-2">
            Browse our full range of daily essentials
          </p>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-card-border rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-5 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <AnimatePresence>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-24">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No products yet
            </h3>
            <p className="text-muted-foreground">
              Check back soon — products are being added.
            </p>
          </div>
        )}
      </section>
    </StoreLayout>
  );
}
