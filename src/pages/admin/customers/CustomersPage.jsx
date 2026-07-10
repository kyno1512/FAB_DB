import { useCallback, useEffect, useMemo, useState } from 'react'
import { IconSearch } from '../dashboard/components/adminIcons'
import AdminTableActions, { AdminDeleteButton } from '../../../components/AdminTableActions'
import MenuPagination from '../menu/components/MenuPagination'
import { useDebounce } from '../../../hooks/useDebounce'
import { confirmAction, showError, showSuccess } from '../../../lib/swal'
import { deleteCustomer, deleteCustomers, getCustomers } from '../../../services/customerAdminService'
import CustomerDetailModal from './components/CustomerDetailModal'

const PAGE_SIZE = 10

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search.trim(), 250)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [deleting, setDeleting] = useState(false)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCustomers({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
      })
      setCustomers(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
      setTotalPages(data.totalPages ?? 0)
    } catch (err) {
      setError(err.message)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const visibleIds = useMemo(
    () => customers.map((item) => item.maKhachHang),
    [customers],
  )

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => visibleIds.includes(id)))
  }, [visibleIds])

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id))
      }
      return [...new Set([...prev, ...visibleIds])]
    })
  }

  async function handleSaved() {
    setSelectedId(null)
    await showSuccess('Đã cập nhật khách hàng.')
    await fetchCustomers()
  }

  async function handleDelete(item) {
    const orderNote = item.soDonHang > 0
      ? ` Khách có ${item.soDonHang} đơn — đơn vẫn giữ lại, chỉ gỡ liên kết khách.`
      : ''
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa ${item.hoTen}?`,
      text: `Dữ liệu khách hàng sẽ bị xóa vĩnh viễn.${orderNote}`,
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    try {
      await deleteCustomer(item.maKhachHang)
      await showSuccess(`Đã xóa ${item.hoTen}.`)
      await fetchCustomers()
    } catch (err) {
      await showError(err.message)
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return

    const count = selectedIds.length
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa ${count} khách hàng?`,
      text: 'Khách đã chọn sẽ bị xóa. Đơn hàng liên quan vẫn giữ, chỉ gỡ liên kết khách.',
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    setDeleting(true)
    setError('')
    try {
      const data = await deleteCustomers(selectedIds)
      setSelectedIds([])
      await fetchCustomers()
      await showSuccess(data.message || `Đã xóa ${count} khách hàng.`)
    } catch (err) {
      setError(err.message)
      await showError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800">Quản lý Khách hàng</h2>
        <p className="mt-1 text-sm text-gray-500">
          Danh sách khách hàng, điểm tích lũy và thông tin liên hệ.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-gray-500 shadow-sm">
          <IconSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, SĐT, email, địa chỉ..."
            className="w-full border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
        </div>

        {selectedIds.length > 0 && (
          <AdminDeleteButton
            count={selectedIds.length}
            loading={deleting}
            onClick={handleDeleteSelected}
          />
        )}
      </div>

      {error && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  disabled={customers.length === 0}
                  className="size-3.5 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary/30"
                  aria-label="Chọn tất cả khách hiển thị"
                />
              </th>
              <th className="px-5 py-3 font-semibold text-gray-600">Khách hàng</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Liên hệ</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Địa chỉ</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Điểm</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Đơn hàng</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Tài khoản</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Ngày tham gia</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-gray-400">Đang tải...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-gray-400">Không tìm thấy khách hàng.</td>
              </tr>
            ) : (
              customers.map((item) => {
                const isSelected = selectedIds.includes(item.maKhachHang)
                return (
                  <tr
                    key={item.maKhachHang}
                    className="cursor-pointer border-b border-gray-50 hover:bg-gray-50/60"
                    onClick={() => setSelectedId(item.maKhachHang)}
                  >
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.maKhachHang)}
                        className="size-3.5 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary/30"
                        aria-label={`Chọn ${item.hoTen}`}
                      />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {item.hoTen}
                      <div className="text-xs text-gray-400">#{item.maKhachHang}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-gray-700">{item.soDienThoai}</div>
                      <div className="text-xs text-gray-400">{item.email || '—'}</div>
                    </td>
                    <td className="max-w-[180px] truncate px-5 py-3.5 text-gray-600">{item.diaChi || '—'}</td>
                    <td className="px-5 py-3.5 font-semibold text-primary">{item.diemTichLuy}</td>
                    <td className="px-5 py-3.5 text-gray-700">{item.soDonHang}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${item.coTaiKhoan ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.coTaiKhoan ? 'Có TK' : 'Khách lẻ'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(item.ngayTao).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <AdminTableActions
                        editTitle="Sửa thông tin"
                        deleteTitle="Xóa khách hàng"
                        onEdit={() => setSelectedId(item.maKhachHang)}
                        onDelete={() => handleDelete(item)}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <MenuPagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {selectedId && (
        <CustomerDetailModal
          customerId={selectedId}
          onClose={() => setSelectedId(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
