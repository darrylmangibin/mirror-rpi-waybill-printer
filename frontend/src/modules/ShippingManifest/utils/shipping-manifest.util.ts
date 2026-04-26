export const formatLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const formatDate = (value: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    date: parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
