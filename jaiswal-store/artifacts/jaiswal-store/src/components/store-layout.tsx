import { Link } from "wouter";
import { useGetShopSettings, getGetShopSettingsQueryKey } from "@workspace/api-client-react";
import { Store, MapPin, Phone } from "lucide-react";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = useGetShopSettings({
    query: { queryKey: getGetShopSettingsQueryKey() }
  });

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Store className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">{settings?.name || "Jaiswal Store"}</span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Admin Login
          </Link>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-secondary text-secondary-foreground py-12 mt-12">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">{settings?.name || "Jaiswal Store"}</span>
            </div>
            <p className="text-secondary-foreground/70 max-w-sm">
              Your trusted neighborhood general store. Honest prices, daily essentials, and community roots.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-secondary-foreground/20 pb-2 inline-block">Contact Us</h3>
            {settings?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-secondary-foreground/80">{settings.address}</span>
              </div>
            )}
            {settings?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-secondary-foreground/80">{settings.phone}</span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
