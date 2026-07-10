import { IconSearch } from '../../dashboard/components/adminIcons'

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'name', label: 'Tên A-Z' },
]

const statusOptions = [
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Tạm ngưng' },
  { value: 'all', label: 'Tất cả' },
]

export default function MenuFilters({
  search,
  onSearchChange,
  maDanhMuc,
  onCategoryChange,
  trangThai,
  onStatusChange,
  sort,
  onSortChange,
  categories,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex flex-1 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-gray-500">
        <IconSearch />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nhập tên món ăn..."
          className="w-full border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={maDanhMuc}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="min-w-[140px] rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-primary"
        >
          <option value="">Danh mục: Tất cả</option>
          {categories.map((cat) => (
            <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
              {cat.tenDanhMuc}
            </option>
          ))}
        </select>

        <select
          value={trangThai}
          onChange={(e) => onStatusChange(e.target.value)}
          className="min-w-[140px] rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-primary"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Trạng thái: {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="min-w-[140px] rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-primary"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sắp xếp: {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
