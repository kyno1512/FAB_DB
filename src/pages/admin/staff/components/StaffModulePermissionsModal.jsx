import { useEffect, useState } from 'react'
import { getStaffModulePermissions, updateStaffModulePermissions } from '../../../../services/staffAdminService'
import { showError, showSuccess } from '../../../../lib/swal'

// Icons cho từng module
const MODULE_ICONS = {
  'Kho': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  'Nhân sự': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  'Đơn hàng': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  'Menu': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'Khuyến mãi': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  'Thống kê': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  'Nhà cung cấp': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
}

function getModuleIcon(tenQuyen) {
  for (const [key, icon] of Object.entries(MODULE_ICONS)) {
    if (tenQuyen.toLowerCase().includes(key.toLowerCase())) {
      return icon
    }
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// Toggle Switch Component
function ToggleSwitch({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
      style={{ backgroundColor: enabled ? '#10b981' : '#ef4444' }}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function StaffModulePermissionsModal({ open, staff, onClose, onSaved }) {
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!open || !staff) return
    loadPermissions()
  }, [open, staff])

  async function loadPermissions() {
    setLoading(true)
    try {
      const data = await getStaffModulePermissions(staff.maNguoiDung)
      if (data?.permissions) {
        setPermissions(data.permissions)
      }
      setIsAdmin(data?.isAdmin === true)
    } catch (err) {
      await showError('Không tải được quyền: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function togglePermission(index) {
    if (isAdmin) return
    setPermissions((prev) =>
      prev.map((p, i) => (i === index ? { ...p, tat: !p.tat } : p))
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateStaffModulePermissions(staff.maNguoiDung, {
        permissions: permissions.map((p) => ({
          maQuyen: p.maQuyen,
          tat: p.tat,
        })),
      })
      await showSuccess('Đã lưu quyền cho ' + staff.hoTen + '.')
      onSaved?.()
      onClose()
    } catch (err) {
      await showError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open || !staff) return null

  const enabledCount = permissions.filter((p) => !p.tat).length

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Phân quyền Module</h3>
              <p className="text-sm text-white/80">{staff.hoTen}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <svg className="h-4 w-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-white">Quản trị viên - Toàn quyền truy cập</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-3 text-sm text-gray-500">Đang tải quyền...</p>
            </div>
          ) : permissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">Không có module nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {permissions.map((perm, index) => (
                <div
                  key={perm.maQuyen}
                  className={`group flex flex-col items-start justify-between rounded-xl border p-4 transition-all duration-200 ${
                    perm.tat
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300'
                  } ${isAdmin ? '' : 'hover:shadow-md cursor-pointer'}`}
                  onClick={() => togglePermission(index)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      perm.tat ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {getModuleIcon(perm.tenQuyen)}
                    </div>
                    <div>
                      <p className={`font-semibold ${perm.tat ? 'text-gray-500' : 'text-gray-800'}`}>
                        {perm.tenQuyen}
                      </p>
                      {perm.moTa && (
                        <p className="text-xs text-gray-400 mt-0.5">{perm.moTa}</p>
                      )}
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={!perm.tat}
                    onChange={() => togglePermission(index)}
                    disabled={isAdmin}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && permissions.length > 0 && (
            <div className="mt-5 flex items-center justify-between rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-600">
                  <span className="text-emerald-600">{enabledCount}</span> / {permissions.length} module đang bật
                </span>
              </div>
              <div className={`h-2 w-24 overflow-hidden rounded-full bg-gray-200`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(enabledCount / permissions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200/50"
          >
            Đóng
          </button>
          {!isAdmin && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-primary/40 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Lưu thay đổi
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
