const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function MenuPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  itemLabel = 'món ăn',
}) {
  if (totalCount === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)
  const pages = buildPageList(page, totalPages)

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-gray-500">
          Hiển thị <strong className="text-gray-700">{from}–{to}</strong> trên{' '}
          <strong className="text-gray-700">{totalCount}</strong> {itemLabel}
        </p>

        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="whitespace-nowrap">Bản ghi / trang</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-primary"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <NavBtn disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Trang trước">
          ‹
        </NavBtn>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <PageBtn key={p} active={p === page} onClick={() => onPageChange(p)}>
              {p}
            </PageBtn>
          ),
        )}
        <NavBtn disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Trang sau">
          ›
        </NavBtn>
      </div>
    </div>
  )
}

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`grid min-w-9 place-items-center rounded-lg px-2 py-1.5 text-sm transition ${
        active
          ? 'bg-primary font-semibold text-white'
          : disabled
            ? 'cursor-not-allowed text-gray-300'
            : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function NavBtn({ children, disabled, onClick, ...rest }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`grid min-h-10 min-w-10 place-items-center rounded-lg text-2xl font-light leading-none transition ${
        disabled ? 'cursor-not-allowed text-gray-300' : 'text-gray-700 hover:bg-gray-100'
      }`}
      {...rest}
    >
      {children}
    </button>
  )
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = [1]
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
