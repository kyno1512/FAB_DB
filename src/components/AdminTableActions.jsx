import { IconEdit, IconTrash, IconKey } from '../pages/admin/dashboard/components/adminIcons'

const editBtnClass =
  'grid size-9 place-items-center rounded-xl border border-transparent text-gray-400 transition hover:border-primary/15 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40'

const deleteBtnClass =
  'grid size-9 place-items-center rounded-xl border border-transparent text-gray-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40'

const permBtnClass =
  'grid size-9 place-items-center rounded-xl border border-transparent text-gray-400 transition hover:border-yellow-100 hover:bg-yellow-50 hover:text-yellow-600 disabled:cursor-not-allowed disabled:opacity-40'

export default function AdminTableActions({
  onEdit,
  onDelete,
  onPermissions,
  editTitle = 'Sửa',
  deleteTitle = 'Xóa',
  permissionsTitle = 'Phân quyền',
  deleteDisabled = false,
}) {
  return (
    <div className="flex items-center gap-1">
      {onPermissions && (
        <button type="button" title={permissionsTitle} onClick={onPermissions} className={permBtnClass}>
          <IconKey />
        </button>
      )}
      {onEdit && (
        <button type="button" title={editTitle} onClick={onEdit} className={editBtnClass}>
          <IconEdit />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          title={deleteTitle}
          disabled={deleteDisabled}
          onClick={onDelete}
          className={deleteBtnClass}
        >
          <IconTrash />
        </button>
      )}
    </div>
  )
}

export function AdminDeleteButton({ onClick, disabled, loading, count, className = '' }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 ${className}`}
    >
      <IconTrash size={18} />
      {loading ? 'Đang xóa...' : `Xóa đã chọn (${count})`}
    </button>
  )
}
