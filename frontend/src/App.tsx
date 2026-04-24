import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/home/page";
import ShippingManifestPage from "@/pages/shipping-manifest/page";
import ShippingManifestDetailsPage from "@/pages/shipping-manifest-details/page";

import ShippingManifestLayout from "@/modules/ShippingManifest/layouts/ShippingManifestLayout";

function App() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shipping-manifests" element={<ShippingManifestLayout />}>
          <Route index element={<ShippingManifestPage />} />
          <Route path=":id" element={<ShippingManifestDetailsPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </main>
  );
}

export default App;
