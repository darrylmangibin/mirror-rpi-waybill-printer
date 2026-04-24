import type { ReactNode } from "react";
import { useScanner } from "../hooks/useScanner";
import { ScannerStatus } from "./ScannerStatus";

interface ScannerLayoutProps {
  onScan: (value: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
}

export const ScannerLayout = ({
  onScan,
  isLoading,
  isDisabled,
  children,
}: ScannerLayoutProps) => {
  const { inputRef, scannedValue, handleKeyDown, handleChange } = useScanner(
    onScan,
    { isDisabled: isLoading || isDisabled },
  );

  return (
    <div className="relative min-h-screen">
      {/* Hidden input for barcode scanner support */}
      <input
        ref={inputRef}
        type="text"
        className="fixed left-0 top-0 opacity-0 pointer-events-none"
        value={scannedValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-hidden="true"
        disabled={isLoading || isDisabled}
      />

      {/* Visual Feedback */}
      <ScannerStatus isLoading={isLoading} isDisabled={isDisabled} />

      {/* Page Content */}
      {children}
    </div>
  );
};

export default ScannerLayout;
