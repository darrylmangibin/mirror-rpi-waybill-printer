import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/home/page";
import ShippingManifestPage from "@/pages/shipping-manifest/page";
import ShippingManifestDetailsPage from "@/pages/shipping-manifest-details/page";

function App() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shipping-manifests" element={<ShippingManifestPage />} />
        <Route
          path="/shipping-manifests/:id"
          element={<ShippingManifestDetailsPage />}
        />
      </Routes>
      <Toaster position="top-right" />
    </main>
  );
}

export default App;
