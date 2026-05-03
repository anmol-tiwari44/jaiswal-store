import { useLocation } from "wouter";
import { useEffect } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

export function useAuthGuard() {
  const [location, setLocation] = useLocation();
  const { data: session, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      staleTime: 0,
    }
  });

  useEffect(() => {
    if (!isLoading && (!session || !session.isAdmin)) {
      if (location.startsWith("/admin")) {
        setLocation("/login");
      }
    }
  }, [session, isLoading, location, setLocation]);

  return { session, isLoading };
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, session } = useAuthGuard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}
