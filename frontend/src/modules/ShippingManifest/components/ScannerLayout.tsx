import { type ReactNode, useState } from "react";
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
  const [isFocused, setIsFocused] = useState(false);

  const { inputRef, scannedValue, handleKeyDown, handleChange } = useScanner(
    onScan,
    { isDisabled: isLoading || isDisabled },
  );

  const handleFocusClick = () => {
    inputRef.current?.focus();
  };

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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Visual Feedback - Floating Top Right */}
      <div className="fixed top-6 right-6 z-[60] animate-in fade-in slide-in-from-top-4 duration-500">
        <ScannerStatus
          isLoading={isLoading}
          isDisabled={isDisabled || !isFocused}
          onClick={handleFocusClick}
        />
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
};

export default ScannerLayout;
