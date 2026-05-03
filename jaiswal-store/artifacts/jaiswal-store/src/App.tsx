import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Storefront from "@/pages/storefront";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import ProductForm from "@/pages/product-form";
import ShopSettings from "@/pages/shop-settings";
import ChangeCredentials from "@/pages/change-credentials";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Storefront} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products/new" component={ProductForm} />
      <Route path="/admin/products/:id/edit" component={ProductForm} />
      <Route path="/admin/settings" component={ShopSettings} />
      <Route path="/admin/change-credentials" component={ChangeCredentials} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
