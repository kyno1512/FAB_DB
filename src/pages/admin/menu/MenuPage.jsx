import { useCallback, useEffect, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import { useDebounce } from '../../../hooks/useDebounce'
import { confirmAction, showError, showSuccess } from '../../../lib/swal'
import { paths } from '../../../routes/paths'
import { getCategories } from '../../../services/categoryService'
import { deleteProduct, getProducts } from '../../../services/productService'
import MenuFilters from './components/MenuFilters'
import MenuPagination from './components/MenuPagination'
import ProductTable from './components/ProductTable'
import SizeManager from './components/SizeManager'
import { getComboCategoryId } from './productFormUtils'

const PAGE_SIZE = 6

export default function MenuPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('products')

  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [search, setSearch] = useState('')
  const [maDanhMuc, setMaDanhMuc] = useState('')
  const [sort, setSort] = useState('newest')
  const [trangThai, setTrangThai] = useState('active')

  const debouncedSearch = useDebounce(search)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProducts({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        maDanhMuc: maDanhMuc || undefined,
        sort,
        trangThai: trangThai === 'all' ? undefined : trangThai === 'active',
      })
      setProducts(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
      setTotalPages(data.totalPages ?? 0)
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, maDanhMuc, sort, trangThai])

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  function handleSearchChange(value) {
    setSearch(value)
    setPage(1)
  }

  function handleCategoryChange(value) {
    setMaDanhMuc(value)
    setPage(1)
  }

  function handleSortChange(value) {
    setSort(value)
    setPage(1)
  }

  function handleStatusChange(value) {
    setTrangThai(value)
    setPage(1)
  }

  const comboCategoryId = getComboCategoryId(categories)
  const isComboFilter = comboCategoryId && String(maDanhMuc) === String(comboCategoryId)

  async function handleDelete(item) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: 'Xóa món?',
      text: `Món "${item.tenSanPham}" sẽ bị xóa vĩnh viễn khỏi thực đơn. Muốn tạm ẩn thì dùng chỉnh sửa → tắt "Đang bán".`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    try {
      await deleteProduct(item.maSanPham)
      await fetchProducts()
      await showSuccess(`Đã xóa "${item.tenSanPham}".`)
    } catch (err) {
      await showError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Quản lý Thực đơn</h2>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý sản phẩm, giá bán và trạng thái kinh doanh.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button
            variant="outline"
            className="!w-auto px-5 py-2.5 text-sm"
            onClick={() => navigate(paths.ADMIN_MENU_NEW_COMBO)}
          >
            + Thêm combo
          </Button>
          <Button
            className="!w-auto px-5 py-2.5 text-sm"
            onClick={() => navigate(paths.ADMIN_MENU_NEW)}
          >
            + Thêm món mới
          </Button>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'products'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sản phẩm
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sizes')}
          className={`px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === 'sizes'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Quản lý Size
        </button>
      </div>

      {/* Size Manager Tab */}
      {activeTab === 'sizes' && (
        <SizeManager />
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
      <MenuFilters
        search={search}
        onSearchChange={handleSearchChange}
        maDanhMuc={maDanhMuc}
        onCategoryChange={handleCategoryChange}
        trangThai={trangThai}
        onStatusChange={handleStatusChange}
        sort={sort}
        onSortChange={handleSortChange}
        categories={categories}
      />

      {error && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <ProductTable
        products={products}
        loading={loading}
        emptyMessage={
          isComboFilter
            ? 'Chưa có combo nào. Tạo combo bằng cách chọn các món có sẵn trong thực đơn.'
            : undefined
        }
        emptyActionLabel={isComboFilter ? '+ Tạo combo đầu tiên' : undefined}
        onEmptyAction={isComboFilter ? () => navigate(paths.ADMIN_MENU_NEW_COMBO) : undefined}
        onEdit={(item) => navigate(generatePath(paths.ADMIN_MENU_EDIT, { id: item.maSanPham }))}
        onDelete={handleDelete}
      />

      <MenuPagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
        </>
      )}
    </div>
  )
}
