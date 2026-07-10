import { useCallback, useEffect, useState } from 'react'
import { IconSearch } from '../dashboard/components/adminIcons'
import AdminTableActions from '../../../components/AdminTableActions'
import { useDebounce } from '../../../hooks/useDebounce'
import { confirmAction, showError, showSuccess } from '../../../lib/swal'
import { createStaff, deleteStaff, getStaffList, getStaffRoles, updateStaff } from '../../../services/staffAdminService'
import { getRoleLabel, ROLE_COLORS } from './roleLabels'
import StaffFormModal from './components/StaffFormModal'
import StaffModulePermissionsModal from './components/StaffModulePermissionsModal'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search.trim(), 250)
  const [modalStaff, setModalStaff] = useState(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [permStaff, setPermStaff] = useState(null)
  const [permOpen, setPermOpen] = useState(false)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStaffList(debouncedSearch || undefined)
      setStaff(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      setStaff([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    getStaffRoles()
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => setRoles([]))
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  function openCreate() {
    setModalStaff(undefined)
    setModalOpen(true)
  }

  function openEdit(item) {
    setModalStaff(item)
    setModalOpen(true)
  }

  function openPermissions(item) {
    setPermStaff(item)
    setPermOpen(true)
  }

  async function handleSubmit(payload) {
    if (modalStaff) {
      await updateStaff(modalStaff.maNguoiDung, payload)
      await showSuccess('Đã cập nhật nhân sự.')
    } else {
      await createStaff(payload)
      await showSuccess('Đã tạo tài khoản nhân sự.')
    }
    setModalOpen(false)
    await fetchStaff()
  }

  async function handleDelete(item) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa ${item.hoTen}?`,
      text: 'Tài khoản nhân sự sẽ bị xóa vĩnh viễn. Shipper đã gán trên đơn cũ sẽ được gỡ.',
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    try {
      await deleteStaff(item.maNguoiDung)
      await showSuccess(`Đã xóa ${item.hoTen}.`)
      await fetchStaff()
    } catch (err) {
      await showError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Quản lý Nhân sự & Vai trò</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gán vai trò Admin, Quản lý, Nhân viên, Shipper — dùng khi duyệt giao hàng.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          + Thêm nhân sự
        </button>
      </div>

      <div className="flex flex-1 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-gray-500 shadow-sm">
        <IconSearch />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tên, email, SĐT, vai trò..."
          className="w-full border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
      </div>

      {error && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-5 py-3 font-semibold text-gray-600">Nhân sự</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Email</th>
              <th className="px-5 py-3 font-semibold text-gray-600">SĐT</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Vai trò</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Trạng thái</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Ngày tạo</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-400">Đang tải...</td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-400">Chưa có nhân sự nào.</td>
              </tr>
            ) : (
              staff.map((item) => (
                <tr key={item.maNguoiDung} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{item.hoTen}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.email}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.soDienThoai}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${ROLE_COLORS[item.tenVaiTro] || 'bg-gray-100 text-gray-600'}`}>
                      {getRoleLabel(item.tenVaiTro)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${item.trangThai ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {item.trangThai ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {new Date(item.ngayTao).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminTableActions
                      editTitle="Sửa thông tin"
                      deleteTitle="Xóa nhân sự"
                      permissionsTitle="Phân quyền"
                      onEdit={() => openEdit(item)}
                      onDelete={() => handleDelete(item)}
                      onPermissions={() => openPermissions(item)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <StaffFormModal
        open={modalOpen}
        staff={modalStaff}
        roles={roles}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <StaffModulePermissionsModal
        open={permOpen}
        staff={permStaff}
        onClose={() => setPermOpen(false)}
        onSaved={fetchStaff}
      />
    </div>
  )
}
