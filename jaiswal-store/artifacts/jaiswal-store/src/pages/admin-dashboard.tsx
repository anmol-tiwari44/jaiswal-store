import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Store,
  Plus,
  Settings,
  KeyRound,
  LogOut,
  Package,
  Tag,
  TrendingDown,
  Pencil,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import {
  useListProducts,
  getListProductsQueryKey,
  useDeleteProduct,
  useGetMe,
  getGetMeQueryKey,
  useLogout,
  useGetProductStats,
  getGetProductStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";

function AdminContent() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: session } = useGetMe({
    query: { queryKey: getGetMeQueryKey() },
  });
  const { data: products, isLoading } = useListProducts({
    query: { queryKey: getListProductsQueryKey() },
  });
  const { data: stats } = useGetProductStats({
    query: { queryKey: getGetProductStatsQueryKey() },
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
    },
  });

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
      },
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteMutation.mutate({ id });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Admin Dashboard</p>
              <p className="text-secondary-foreground/60 text-xs">
                {session?.username && `Logged in as ${session.username}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings">
              <button className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </Link>
            <Link href="/admin/change-credentials">
              <button className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                <KeyRound className="h-4 w-4" />
                <span>Credentials</span>
              </button>
            </Link>
            <button
              onClick={() => logoutMutation.mutate({})}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-red-300 border border-red-400/30 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-primary" },
              { label: "On Discount", value: stats.onDiscount, icon: Tag, color: "text-destructive" },
              { label: "Avg Discount", value: `${stats.avgDiscount}%`, icon: TrendingDown, color: "text-green-600" },
              {
                label: "Price Range",
                value: stats.lowestPrice != null ? `₹${stats.lowestPrice?.toFixed(0)} – ₹${stats.highestPrice?.toFixed(0)}` : "—",
                icon: Store,
                color: "text-accent-foreground",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-card border border-card-border rounded-2xl p-5 shadow-sm"
              >
                <div className={`${color} mb-2`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-foreground leading-none">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Actions row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground">Products</h2>
          <div className="flex gap-2">
            <Link href="/admin/settings">
              <button className="sm:hidden flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </Link>
            <Link href="/admin/change-credentials">
              <button className="sm:hidden flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
                <KeyRound className="h-4 w-4" />
                Credentials
              </button>
            </Link>
            <Link href="/admin/products/new">
              <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary/90 transition shadow-sm">
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </Link>
          </div>
        </div>

        {/* Products table */}
        {isLoading ? (
          <div className="bg-card border border-card-border rounded-2xl p-8 text-center text-muted-foreground">
            Loading products...
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3.5 font-semibold">#</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Image</th>
                    <th className="text-left px-5 py-3.5 font-semibold">Name</th>
                    <th className="text-right px-5 py-3.5 font-semibold">Price</th>
                    <th className="text-center px-5 py-3.5 font-semibold">Discount</th>
                    <th className="text-right px-5 py-3.5 font-semibold">Final</th>
                    <th className="text-center px-5 py-3.5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-muted-foreground">{i + 1}</td>
                      <td className="px-5 py-4">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-foreground max-w-[200px] truncate">
                        {p.name}
                      </td>
                      <td className="px-5 py-4 text-right text-muted-foreground">
                        ₹{p.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {p.discount > 0 ? (
                          <span className="bg-destructive/10 text-destructive text-xs font-bold px-2.5 py-1 rounded-full">
                            ₹{p.discount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-primary">
                        ₹{p.finalPrice.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/admin/products/${p.id}/edit`}>
                            <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-4 py-4"
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-12 w-12 rounded-xl object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-bold text-sm">₹{p.finalPrice.toFixed(2)}</span>
                      {p.discount > 0 && (
                        <span className="text-xs text-muted-foreground line-through">₹{p.price.toFixed(2)}</span>
                      )}
                      {p.discount > 0 && (
                        <span className="text-xs bg-destructive/10 text-destructive font-bold px-1.5 py-0.5 rounded-full">₹{p.discount} OFF</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link href={`/admin/products/${p.id}/edit`}>
                      <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl p-16 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-5">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No products yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Add your first product to get started.
            </p>
            <Link href="/admin/products/new">
              <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition">
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
