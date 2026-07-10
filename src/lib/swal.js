import Swal from 'sweetalert2'

export const SWAL_CONFIRM_COLOR = '#1e6b6b'

export async function confirmAction({
  title,
  text,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  icon = 'question',
  confirmButtonColor = SWAL_CONFIRM_COLOR,
}) {
  const result = await Swal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor,
  })
  return result.isConfirmed
}

export function showError(message, title = 'Lỗi') {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: SWAL_CONFIRM_COLOR,
  })
}

export function showSuccess(message, title = 'Thành công') {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonColor: SWAL_CONFIRM_COLOR,
  })
}

export async function showConfirm(title, text) {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
    confirmButtonColor: SWAL_CONFIRM_COLOR,
  })
  return result.isConfirmed
}
