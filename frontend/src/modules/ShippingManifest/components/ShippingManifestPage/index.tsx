import { useMemo, useState } from "react";
import { TopNavbar } from "@/components/global/components/TopNavbar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ManifestStatus =
  | "completed"
  | "open"
  | "closed"
  | "for_loading"
  | "loaded";

type ShippingManifest = {
  id: string;
  manifest_code: string;
  shipping_carrier: string;
  receiver_name: string;
  vehicle_plate_number: string;
  loaded_orders_count: number;
  status: ManifestStatus;
  created_at: string;
  loaded_at: string | null;
};

const statuses: ManifestStatus[] = [
  "completed",
  "open",
  "closed",
  "for_loading",
  "loaded",
];

const carriers = [
  "SPX Express",
  "J&T Express",
  "Flash Express",
  "Ninja Van",
  "LBC",
];
const receivers = [
  "Rico Santos",
  "Anna Dela Cruz",
  "Mark Villanueva",
  "Liza Fernandez",
  "Paolo Reyes",
  "Mika Tan",
];

const getRandomItem = <T,>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

const randomDateWithinDays = (daysBack: number) => {
  const now = Date.now();
  const start = now - daysBack * 24 * 60 * 60 * 1000;
  return new Date(start + Math.random() * (now - start));
};

const createMockManifests = (count: number): ShippingManifest[] =>
  Array.from({ length: count }, (_, index) => {
    const status = getRandomItem(statuses);
    const createdAt = randomDateWithinDays(30);
    const loadedAt =
      status === "loaded" || status === "completed"
        ? new Date(
            createdAt.getTime() +
              Math.floor(Math.random() * 6) * 60 * 60 * 1000,
          )
        : null;

    return {
      id: crypto.randomUUID(),
      manifest_code: `KMTO-${String(index + 1).padStart(4, "0")}`,
      shipping_carrier: getRandomItem(carriers),
      receiver_name: getRandomItem(receivers),
      vehicle_plate_number: `N${Math.floor(100 + Math.random() * 899)}-${Math.floor(
        100 + Math.random() * 899,
      )}`,
      loaded_orders_count: Math.floor(Math.random() * 150) + 1,
      status,
      created_at: createdAt.toISOString(),
      loaded_at: loadedAt?.toISOString() ?? null,
    };
  });

const statusBadgeClass: Record<ManifestStatus, string> = {
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  open: "bg-blue-100 text-blue-800 border-blue-200",
  closed: "bg-slate-100 text-slate-800 border-slate-200",
  for_loading: "bg-amber-100 text-amber-800 border-amber-200",
  loaded: "bg-violet-100 text-violet-800 border-violet-200",
};

const ShippingManifestPage = () => {
  const [selectedStatus, setSelectedStatus] = useState<ManifestStatus | "all">(
    "all",
  );
  const [manifests] = useState<ShippingManifest[]>(() =>
    createMockManifests(60),
  );

  const filteredManifests = useMemo(() => {
    if (selectedStatus === "all") return manifests;
    return manifests.filter((manifest) => manifest.status === selectedStatus);
  }, [manifests, selectedStatus]);

  return (
    <>
      <TopNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Shipping Manifest
            </h1>
            <p className="text-sm text-gray-600">
              Mock list ({filteredManifests.length} of {manifests.length})
            </p>
          </div>
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(value as ManifestStatus | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableHead>Manifest Code</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Plate Number</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Loaded At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManifests.map((manifest) => (
                <TableRow key={manifest.id}>
                  <TableCell className="font-medium">
                    {manifest.manifest_code}
                  </TableCell>
                  <TableCell>{manifest.shipping_carrier}</TableCell>
                  <TableCell>{manifest.receiver_name}</TableCell>
                  <TableCell>{manifest.vehicle_plate_number}</TableCell>
                  <TableCell>{manifest.loaded_orders_count}</TableCell>
                  <TableCell>
                    <Badge className={statusBadgeClass[manifest.status]}>
                      {manifest.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(manifest.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {manifest.loaded_at
                      ? new Date(manifest.loaded_at).toLocaleString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default ShippingManifestPage;
