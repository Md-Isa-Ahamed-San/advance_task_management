interface CategoryTableProps {
  data: {
    category: string
    total: number
    completed: number
    rate: number
  }[]
}

const CATEGORY_COLORS = [
  'var(--primary)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function CategoryTable({ data }: CategoryTableProps) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <p className="text-2xl mb-2">📂</p>
        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          No categories yet
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Add categories to your tasks to see the breakdown here.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div className="border-b px-5 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Performance by Category
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Task completion rates across different categories
          </p>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {data.map((row, i) => {
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]!
          return (
            <div
              key={row.category}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
            >
              {/* Color dot + name */}
              <div className="flex items-center gap-2 w-28 shrink-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span
                  className="text-sm font-medium capitalize truncate"
                  style={{ color: 'var(--foreground)' }}
                >
                  {row.category}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex-1">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${row.rate}%`, backgroundColor: color }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex shrink-0 items-center gap-4 text-right">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {row.completed}/{row.total}
                </span>
                <span
                  className="w-10 text-right text-sm font-bold tabular-nums"
                  style={{ color: 'var(--foreground)' }}
                >
                  {row.rate}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
