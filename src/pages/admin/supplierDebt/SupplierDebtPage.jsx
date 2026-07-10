import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import AdminTableActions from '../../../components/AdminTableActions'
import { useDebounce } from '../../../hooks/useDebounce'
import { confirmAction, showError, showSuccess } from '../../../lib/swal'
import { IconSearch } from '../dashboard/components/adminIcons'
import MenuPagination from '../menu/components/MenuPagination'
import SupplierFormModal from './components/SupplierFormModal'
import SupplierDetailModal, { getInitials } from './components/SupplierDetailModal'
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from '../../../services/supplierDebtAdminService'

const PAGE_SIZE = 8

function SupplierAvatar({ name }) {
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/90 to-primary font-display text-sm font-bold text-white shadow-sm">
      {getInitials(name)}
    </div>
  )
}

export default function SupplierDebtPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [supplierModal, setSupplierModal] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  const debouncedSearch = useDebounce(search.trim(), 250)

  const activeCount = useMemo(
    () => suppliers.filter((item) => item.trangThai).length,
    [suppliers],
  )

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getSuppliers({ page, pageSize: PAGE_SIZE, search: debouncedSearch || undefined })
      setSuppliers(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
      setTotalPages(data.totalPages ?? 0)
    } catch (err) {
      setError(err.message)
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  async function handleSaveSupplier(form, id) {
    const payload = {
      tenNhaCungCap: form.tenNhaCungCap.trim(),
      nguoiLienHe: form.nguoiLienHe.trim() || null,
      soDienThoai: form.soDienThoai.trim() || null,
      email: form.email.trim() || null,
      diaChi: form.diaChi.trim() || null,
      maSoThue: form.maSoThue?.trim() || null,
      trangThai: form.trangThai,
    }
    if (id) await updateSupplier(id, payload)
    else await createSupplier(payload)
    setSupplierModal(null)
    await showSuccess(id ? 'Đã cập nhật nhà cung cấp.' : 'Đã thêm nhà cung cấp.')
    await fetchList()
  }

  async function handleDeleteSupplier(item) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa ${item.tenNhaCungCap}?`,
      text: 'Chỉ xóa được khi chưa có phiếu nhập liên kết.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return
    try {
      await deleteSupplier(item.maNhaCungCap)
      await showSuccess('Đã xóa nhà cung cấp.')
      await fetchList()
    } catch (err) {
      await showError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Quản lý nhà cung cấp</h2>
          <p className="mt-1 text-sm text-gray-500">Thêm, sửa thông tin liên hệ và trạng thái hợp tác.</p>
        </div>
        <Button className="!w-auto px-5 py-2.5 text-sm shadow-md shadow-primary/15" onClick={() => setSupplierModal({})}>
          + Thêm nhà cung cấp
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[14px] border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tổng nhà cung cấp</p>
          <p className="mt-2 font-display text-3xl font-bold text-gray-800">{totalCount}</p>
        </div>
        <div className="rounded-[14px] border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600/80">Đang hợp tác</p>
          <p className="mt-2 font-display text-3xl font-bold text-emerald-700">{activeCount}</p>
        </div>
      </div>

      <div className="rounded-[14px] border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, SĐT, email NCC..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">Bấm vào dòng để xem chi tiết nhà cung cấp</p>
      </div>

      {error && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="rounded-[14px] border border-gray-100 bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
          Đang tải...
        </div>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4">Nhà cung cấp</th>
                <th className="px-5 py-4">Liên hệ</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <p className="font-medium text-gray-600">Chưa có nhà cung cấp</p>
                    <p className="mt-1 text-sm text-gray-400">Bấm &quot;+ Thêm nhà cung cấp&quot; để bắt đầu.</p>
                  </td>
                </tr>
              ) : (
                suppliers.map((item) => (
                  <tr
                    key={item.maNhaCungCap}
                    className="group cursor-pointer border-b border-gray-50 transition last:border-none hover:bg-primary/[0.03]"
                    onClick={() => setSelectedSupplier(item)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <SupplierAvatar name={item.tenNhaCungCap} />
                        <div className="min-w-0">
                          <strong className="block font-medium text-gray-800 group-hover:text-primary">
                            {item.tenNhaCungCap}
                          </strong>
                          {item.nguoiLienHe && <p className="text-xs text-gray-500">{item.nguoiLienHe}</p>}
                          {item.maSoThue && (
                            <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-gray-400">
                              MST {item.maSoThue}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <p className="font-medium text-gray-700">{item.soDienThoai ?? '—'}</p>
                      <p className="text-xs text-gray-400">{item.email || 'Chưa có email'}</p>
                      {item.diaChi && <p className="mt-1 text-xs text-gray-400 line-clamp-1">{item.diaChi}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.trangThai ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.trangThai ? 'Đang hợp tác' : 'Ngừng hợp tác'}
                      </span>
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <span className="mr-1 text-xs text-gray-300 opacity-0 transition group-hover:opacity-100">
                          Chi tiết →
                        </span>
                        <AdminTableActions
                          editTitle="Sửa NCC"
                          deleteTitle="Xóa NCC"
                          onEdit={() => setSupplierModal(item)}
                          onDelete={() => handleDeleteSupplier(item)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <MenuPagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemLabel="nhà cung cấp"
      />

      <SupplierDetailModal
        supplier={selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        onEdit={(item) => {
          setSelectedSupplier(null)
          setSupplierModal(item)
        }}
      />

      <SupplierFormModal
        open={supplierModal !== null}
        supplier={supplierModal?.maNhaCungCap ? supplierModal : null}
        onClose={() => setSupplierModal(null)}
        onSaved={handleSaveSupplier}
      />
    </div>
  )
}
