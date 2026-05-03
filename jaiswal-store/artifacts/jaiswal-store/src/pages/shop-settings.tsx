import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Store, Save } from "lucide-react";
import {
  useGetShopSettings,
  getGetShopSettingsQueryKey,
  useUpdateShopSettings,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";

function ShopSettingsContent() {
  const queryClient = useQueryClient();
  const { data: shop, isLoading } = useGetShopSettings({
    query: { queryKey: getGetShopSettingsQueryKey() },
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setPhone(shop.phone || "");
      setAddress(shop.address || "");
    }
  }, [shop]);

  const updateMutation = useUpdateShopSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetShopSettingsQueryKey() });
        setSuccess("Shop settings updated!");
        setTimeout(() => setSuccess(""), 3000);
      },
      onError: () => setError("Failed to update. Please try again."),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    updateMutation.mutate({ data: { name, phone: phone || null, address: address || null } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground shadow-md">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/admin">
            <button className="flex items-center gap-2 text-secondary-foreground/70 hover:text-secondary-foreground transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </Link>
          <span className="text-secondary-foreground/30">|</span>
          <h1 className="font-bold text-sm">Shop Settings</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-card-border rounded-3xl shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Shop Settings</h2>
              <p className="text-muted-foreground text-sm">Update your store information</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-11 bg-muted rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Shop Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Jaiswal Store"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="Shop address..."
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3"
                >
                  {success}
                </motion.p>
              )}

              <div className="flex gap-3 pt-2">
                <Link href="/admin" className="flex-1">
                  <button
                    type="button"
                    className="w-full h-11 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {updateMutation.isPending ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {updateMutation.isPending ? "Saving..." : "Update Settings"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ShopSettings() {
  return (
    <AuthGuard>
      <ShopSettingsContent />
    </AuthGuard>
  );
}
