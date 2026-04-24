import { useEffect, useRef, useState } from "react";

export const useScanner = (onScan: (value: string) => void) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scannedValue, setScannedValue] = useState("");

  useEffect(() => {
    const handleFocus = () => {
      const activeElement = document.activeElement;
      
      // Check if the current focused element is an input or interactive
      const isInput =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "SELECT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.getAttribute("contenteditable") === "true" ||
        activeElement?.getAttribute("role") === "combobox";

      if (!isInput) {
        inputRef.current?.focus();
      }
    };

    // Initial focus
    const timer = setTimeout(handleFocus, 100);

    document.addEventListener("click", handleFocus);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (scannedValue.trim()) {
        onScan(scannedValue.trim());
      }
      setScannedValue("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScannedValue(e.target.value);
  };

  return {
    inputRef,
    scannedValue,
    handleKeyDown,
    handleChange,
  };
};
