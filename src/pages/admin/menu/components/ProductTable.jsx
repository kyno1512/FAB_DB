import { formatPrice } from '../../../../lib/formatPrice'
import { getProductImageUrl, getProductImageFallback } from '../../../../lib/productImage'
import AdminTableActions from '../../../../components/AdminTableActions'
import { useState } from 'react'

function ProductThumb({ item }) {
  const [failed, setFailed] = useState(false)
  const src = failed
    ? getProductImageFallback(item.tenSanPham, item.tenDanhMuc)
    : getProductImageUrl({
        hinhAnhChinh: item.hinhAnhChinh,
        tenSanPham: item.tenSanPham,
        tenDanhMuc: item.tenDanhMuc,
      })

  return (
    <img
      src={src}
      alt={item.tenSanPham}
      className="size-12 rounded-[10px] object-cover bg-gray-100"
      onError={() => {
        if (!failed) setFailed(true)
      }}
    />
  )
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      <span className={`size-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
      {active ? 'Đang bán' : 'Tạm ngưng'}
    </span>
  )
}

export default function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
}) {
  if (loading) {
    return (
      <div className="rounded-[14px] bg-white p-12 text-center text-sm text-gray-500 shadow-sm">
        Đang tải thực đơn...
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[14px] bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          {emptyMessage ?? 'Chưa có món nào. Hãy thêm sản phẩm hoặc chạy seed SQL trên FAB_DB.'}
        </p>
        {onEmptyAction && emptyActionLabel && (
          <button
            type="button"
            onClick={onEmptyAction}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {emptyActionLabel}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[14px] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-4">Hình ảnh</th>
              <th className="px-5 py-4">Tên món</th>
              <th className="px-5 py-4">Danh mục</th>
              <th className="px-5 py-4">Giá bán</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.maSanPham} className="border-b border-gray-50 last:border-none hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <ProductThumb item={item} />
                </td>
                <td className="px-5 py-4">
                  <strong className="block font-medium text-gray-800">{item.tenSanPham}</strong>
                  {item.moTa && (
                    <span className="mt-1 block max-w-md text-xs leading-relaxed text-gray-500 line-clamp-3">
                      {item.moTa}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {item.tenDanhMuc}
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-800">{formatPrice(item.giaBan)}</td>
                <td className="px-5 py-4">
                  <StatusBadge active={item.trangThai} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <AdminTableActions
                      editTitle="Sửa món"
                      deleteTitle="Xóa món"
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
