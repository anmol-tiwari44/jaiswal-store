import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, ImageIcon, Upload, Link2, X, Camera } from "lucide-react";
import {
  useGetProduct,
  getGetProductQueryKey,
  useCreateProduct,
  useUpdateProduct,
  getListProductsQueryKey,
  getGetProductStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";

type ImageMode = "upload" | "url";

function ImageUploader({
  imageUrl,
  setImageUrl,
}: {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}) {
  const [mode, setMode] = useState<ImageMode>(imageUrl && !imageUrl.startsWith("/api/uploads") ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploadError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      setImageUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [setImageUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const clearImage = () => {
    setImageUrl("");
    setUploadError("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === "upload"
              ? "bg-white shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === "url"
              ? "bg-white shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          URL
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {imageUrl && imageUrl.startsWith("/api/uploads") ? (
              <div className="relative w-fit">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center shadow"
                >
                  <X className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Camera className="h-3 w-3" /> Change photo
                </button>
              </div>
            ) : (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
                } ${uploading ? "pointer-events-none opacity-60" : ""}`}
              >
                {uploading ? (
                  <>
                    <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading…</p>
                  </>
                ) : (
                  <>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Drop image here or{" "}
                        <span className="text-primary underline">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, WebP up to 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={onFileChange}
              className="hidden"
            />
            {uploadError && (
              <p className="text-xs text-destructive mt-1">{uploadError}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <input
              type="url"
              value={imageUrl.startsWith("/api/uploads") ? "" : imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/product.jpg"
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            {imageUrl && !imageUrl.startsWith("/api/uploads") && (
              <div className="mt-3 relative w-fit">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-28 w-28 object-cover rounded-xl border border-border"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductFormContent() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isEdit = !!params.id;
  const productId = params.id ? parseInt(params.id) : undefined;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [imageUrl, setImageUrl] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { data: product } = useGetProduct(productId!, {
    query: { enabled: isEdit && !!productId, queryKey: getGetProductQueryKey(productId!) },
  });

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price));
      setDiscount(String(product.discount));
      setImageUrl(product.imageUrl || "");
    }
  }, [product]);

  const createMutation = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
        setSuccess("Product added successfully!");
        setTimeout(() => setLocation("/admin"), 1200);
      },
      onError: () => setError("Failed to add product. Please try again."),
    },
  });

  const updateMutation = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
        if (productId) queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
        setSuccess("Product updated successfully!");
        setTimeout(() => setLocation("/admin"), 1200);
      },
      onError: () => setError("Failed to update product. Please try again."),
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const data = {
      name,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      imageUrl: imageUrl || null,
    };
    if (isEdit && productId) {
      updateMutation.mutate({ id: productId, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  const finalPrice = Math.max(0, parseFloat(price) - (parseFloat(discount) || 0));

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
          <h1 className="font-bold text-sm">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-card border border-card-border rounded-3xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Basmati Rice 5kg"
                required
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (₹) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
            </div>

            {price && parseFloat(price) > 0 && (
              <div className="bg-muted/50 border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Final Price</p>
                  <p className="font-bold text-primary text-lg">₹{isNaN(finalPrice) ? "—" : finalPrice.toFixed(2)}</p>
                </div>
                {parseFloat(discount) > 0 && !isNaN(finalPrice) && (
                  <div className="border-l border-border pl-3">
                    <p className="text-xs text-muted-foreground">Savings</p>
                    <p className="font-semibold text-green-600 text-sm">₹{(parseFloat(discount) || 0).toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4" />
                  Product Image
                </span>
              </label>
              <ImageUploader imageUrl={imageUrl} setImageUrl={setImageUrl} />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3"
              >
                {error}
              </motion.p>
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
                disabled={isPending}
                className="flex-1 h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {isPending ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function ProductForm() {
  return (
    <AuthGuard>
      <ProductFormContent />
    </AuthGuard>
  );
}
