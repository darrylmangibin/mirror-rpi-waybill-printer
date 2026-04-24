import { Outlet } from "react-router-dom";
import { useScanner } from "../hooks/useScanner";
import { ScannerStatus } from "../components/ScannerStatus";

const ShippingManifestLayout = () => {
  const { inputRef, scannedValue, handleKeyDown, handleChange } = useScanner(
    (value) => {
      console.log("Global Scanner Captured:", value);
      // Future: Specific page logic can be implemented here via context or custom events
    }
  );

  return (
    <div className="relative min-h-screen">
      {/* Hidden input for global scanner support */}
      <input
        ref={inputRef}
        type="text"
        className="fixed left-0 top-0 opacity-0 pointer-events-none"
        value={scannedValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-hidden="true"
      />

      {/* Visual Feedback */}
      <ScannerStatus />

      {/* Page Content */}
      <Outlet />
    </div>
  );
};

export default ShippingManifestLayout;
