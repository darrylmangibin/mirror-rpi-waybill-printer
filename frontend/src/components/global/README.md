# Global Components

This folder contains reusable, independent components that can be used across the entire application.

## Components

### DataTable

A powerful, reusable data table component built with TanStack Table and shadcn/ui.

#### Features

- **Sorting**: Click column headers to sort (ascending/descending)
- **Filtering**: Search/filter by specified column
- **Column Visibility**: Toggle columns on/off
- **Pagination**: Navigate through pages of data
- **Row Selection**: Select individual or all rows
- **Type-Safe**: Full TypeScript support with generics

#### Usage

```tsx
import { DataTable } from "@/global"
import type { ColumnDef } from "@tanstack/react-table"

type MyData = {
  id: number
  name: string
  status: "active" | "inactive"
}

const columns: ColumnDef<MyData>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
]

const data: MyData[] = [
  { id: 1, name: "John", status: "active" },
  { id: 2, name: "Jane", status: "inactive" },
]

export default function MyPage() {
  const handleRowsSelected = (rows: MyData[]) => {
    console.log("Selected:", rows)
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by name..."
      searchColumn="name"
      pageSize={10}
      onRowsSelected={handleRowsSelected}
    />
  )
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | Required | Column definitions |
| `data` | `TData[]` | Required | Table data |
| `searchPlaceholder` | `string` | "Search..." | Placeholder text for search input |
| `searchColumn` | `string` | Optional | Column key to search on |
| `pageSize` | `number` | 10 | Number of rows per page |
| `onRowsSelected` | `(rows: TData[]) => void` | Optional | Callback when rows are selected |

## Import Shortcuts

You can import directly from the global folder:

```tsx
// Option 1: Direct import
import { DataTable } from "@/global/components/DataTable"

// Option 2: From index (recommended)
import { DataTable } from "@/global"

// Option 3: Type imports
import type { DataTableProps } from "@/global"
```

## Adding New Components

When adding new reusable components:

1. Create the component in `components/` folder
2. Export it from `components/ComponentName.tsx`
3. Add export in `index.ts`
4. Document in this README
