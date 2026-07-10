import { useEffect, useMemo, useState } from 'react'
import { getInventoryItems, createInventoryItem } from '../../../../services/inventoryAdminService'
import Swal from 'sweetalert2'
import { SWAL_CONFIRM_COLOR } from '../../../../lib/swal'

export default function BomItemsPicker({ selectedItems, onChange }) {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState('kg')

  function refreshMaterials() {
    getInventoryItems()
      .then((items) => setMaterials(items ?? []))
      .catch(() => setMaterials([]))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getInventoryItems()
      .then((items) => {
        if (!cancelled) setMaterials(items ?? [])
      })
      .catch(() => {
        if (!cancelled) setMaterials([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return materials
    return materials.filter(
      (m) =>
        m.tenNguyenLieu?.toLowerCase().includes(q) ||
        m.donVi?.toLowerCase().includes(q),
    )
  }, [materials, search])

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((i) => i.maNguyenLieu)),
    [selectedItems],
  )

  const canBanMap = useMemo(() => {
    if (selectedItems.length === 0) return {}
    const result = {}
    for (const item of selectedItems) {
      if (item.soLuong > 0 && item.soLuongTon > 0) {
        result[item.maNguyenLieu] = Math.floor(item.soLuongTon / item.soLuong)
      } else {
        result[item.maNguyenLieu] = 0
      }
    }
    return result
  }, [selectedItems])

  const bottleneck = useMemo(() => {
    const values = Object.values(canBanMap).filter((v) => v > 0)
    return values.length > 0 ? Math.min(...values) : 0
  }, [canBanMap])

  const [tooltip, setTooltip] = useState(null) // { maNguyenLieu }

  const notFound = search.trim().length > 0 && filtered.length === 0 && !loading

  async function handleAddMaterial() {
    const name = newName.trim()
    const unit = newUnit.trim() || 'kg'
    if (!name) return

    setAdding(true)
    try {
      const created = await createInventoryItem({
        tenNguyenLieu: name,
        donVi: unit,
        soLuongTon: 0,
        mucTonToiThieu: 0,
      })

      await refreshMaterials()

      setNewName('')
      setNewUnit('kg')
      setShowAddForm(false)
      setSearch(name)

      onChange([
        ...selectedItems,
        {
          maNguyenLieu: created.maNguyenLieu,
          tenNguyenLieu: created.tenNguyenLieu,
          soLuong: 0.1,
          donVi: created.donVi,
          soLuongTon: 0,
        },
      ])

      await Swal.fire({
        icon: 'success',
        title: 'Đã thêm nguyên liệu',
        text: `${created.tenNguyenLieu} đã được tạo.`,
        confirmButtonColor: SWAL_CONFIRM_COLOR,
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.message,
        confirmButtonColor: SWAL_CONFIRM_COLOR,
      })
    } finally {
      setAdding(false)
    }
  }

  function toggleMaterial(material) {
    if (selectedIds.has(material.maNguyenLieu)) {
      onChange(selectedItems.filter((i) => i.maNguyenLieu !== material.maNguyenLieu))
      return
    }

    onChange([
      ...selectedItems,
      {
        maNguyenLieu: material.maNguyenLieu,
        tenNguyenLieu: material.tenNguyenLieu,
        soLuong: 0.1,
        donVi: material.donVi,
        soLuongTon: material.soLuongTon,
      },
    ])
  }

  function updateLine(maNguyenLieu, patch) {
    onChange(
      selectedItems.map((item) =>
        item.maNguyenLieu === maNguyenLieu ? { ...item, ...patch } : item,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Định mức nguyên liệu cho mỗi phần bán. Khi khách đặt hàng, hệ thống tự kiểm tra và trừ kho.
      </p>

      {selectedItems.length > 0 && (
        <div className="space-y-2 rounded-[10px] border border-primary/20 bg-primary-light/30 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Nguyên liệu đã chọn ({selectedItems.length})
            </p>
            {bottleneck > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Tồn kho đủ làm{' '}
                  <strong className="text-red-600">{bottleneck.toLocaleString('vi-VN')} phần</strong>
                  {Object.entries(canBanMap).filter(([, v]) => v === bottleneck).map(([id]) => {
                    const item = selectedItems.find((s) => s.maNguyenLieu === Number(id))
                    return item ? (
                      <span key={id} className="font-semibold text-red-500"> · Bottleneck: {item.tenNguyenLieu}</span>
                    ) : null
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => setTooltip(tooltip ? null : 'all')}
                  className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20"
                >
                  {tooltip === 'all' ? '▲ Ẩn công thức' : '▼ Xem công thức tính'}
                </button>
              </div>
            )}
          </div>
          {selectedItems.map((item) => {
            const canBan = canBanMap[item.maNguyenLieu] ?? 0
            const isBottleneck = canBan === bottleneck && bottleneck > 0 && item.soLuong > 0 && item.soLuongTon > 0
            return (
            <div
              key={item.maNguyenLieu}
              className={`flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ${isBottleneck ? 'ring-1 ring-red-300 bg-red-50/50' : ''}`}
            >
              <span className={`min-w-0 flex-1 font-medium ${isBottleneck ? 'text-red-700' : 'text-gray-800'}`}>
                {item.tenNguyenLieu}
                {isBottleneck && (
                  <span className="ml-2 text-xs font-normal text-red-400">(ít nhất)</span>
                )}
              </span>
              <input
                type="number"
                min="0.001"
                step="0.001"
                className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                value={item.soLuong}
                onChange={(e) =>
                  updateLine(item.maNguyenLieu, { soLuong: Number(e.target.value) || 0 })
                }
              />
              <input
                className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                value={item.donVi}
                onChange={(e) => updateLine(item.maNguyenLieu, { donVi: e.target.value })}
              />
              <span className="text-xs text-gray-400">
                Tồn: {item.soLuongTon ?? '—'} {item.donVi}
              </span>
              {item.soLuong > 0 && (
                <button
                  type="button"
                  onClick={() => setTooltip(tooltip === item.maNguyenLieu ? null : item.maNguyenLieu)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
                    isBottleneck
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer'
                      : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 cursor-pointer'
                  }`}
                >
                  Đủ {canBan.toLocaleString('vi-VN')} phần
                  <span className="text-xs opacity-70">🖱</span>
                </button>
              )}
              {tooltip === item.maNguyenLieu && (
                <div className="w-full rounded-lg border border-primary/20 bg-primary-light/30 px-3 py-2 text-xs text-gray-600">
                  <strong>Công thức tính:</strong>{' '}
                  <span className="font-mono">
                    {Number(item.soLuongTon).toLocaleString('vi-VN')} {item.donVi}
                    {' ÷ '}
                    {Number(item.soLuong).toLocaleString('vi-VN')} {item.donVi}
                    {' = '}
                    <strong className={isBottleneck ? 'text-red-600' : 'text-emerald-600'}>
                      {canBan.toLocaleString('vi-VN')} phần
                    </strong>
                  </span>
                  {isBottleneck && (
                    <span className="ml-2 font-semibold text-red-500">← Bottleneck</span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => toggleMaterial({ maNguyenLieu: item.maNguyenLieu })}
                className="text-xs text-red-500 hover:underline"
              >
                Xóa
              </button>
            </div>
          )})}
          {tooltip === 'all' && selectedItems.length > 1 && (
            <div className="rounded-lg border border-primary/20 bg-primary-light/30 p-3">
              <p className="mb-2 text-xs font-bold text-primary">Công thức tính cho từng nguyên liệu</p>
              {selectedItems.map((item) => {
                const canBan = canBanMap[item.maNguyenLieu] ?? 0
                const isBottleneck = canBan === bottleneck && bottleneck > 0 && item.soLuong > 0 && item.soLuongTon > 0
                return (
                <div key={item.maNguyenLieu} className="flex items-center gap-2 py-1 text-xs">
                  <span className={`w-40 flex-shrink-0 truncate font-medium ${isBottleneck ? 'text-red-600' : 'text-gray-700'}`}>
                    {item.tenNguyenLieu}
                  </span>
                  <span className="font-mono text-gray-500">
                    {Number(item.soLuongTon).toLocaleString('vi-VN')} {item.donVi} ÷ {Number(item.soLuong).toLocaleString('vi-VN')} {item.donVi}
                  </span>
                  <span className="font-mono text-gray-400">=</span>
                  <span className={`font-bold font-mono ${isBottleneck ? 'text-red-600' : 'text-emerald-600'}`}>
                    {canBan.toLocaleString('vi-VN')} phần
                  </span>
                  {isBottleneck && <span className="text-red-500 font-semibold">← ít nhất</span>}
                </div>
              )})}
              <div className="mt-2 border-t border-primary/20 pt-2 text-xs text-gray-500">
                <strong>Kết quả:</strong> Min({selectedItems.map((item) => (canBanMap[item.maNguyenLieu] ?? 0).toLocaleString('vi-VN')).join(', ')}) ={' '}
                <strong className="text-red-600">{bottleneck.toLocaleString('vi-VN')} phần</strong>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        placeholder="Tìm nguyên liệu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {showAddForm ? (
        <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary-light/20 p-4">
          <p className="mb-3 text-sm font-semibold text-primary">Thêm nguyên liệu mới</p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-xs text-gray-500">Tên nguyên liệu</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="VD: Bột sữa"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMaterial()}
                autoFocus
              />
            </div>
            <div className="w-20">
              <label className="mb-1 block text-xs text-gray-500">Đơn vị</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
                placeholder="kg"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMaterial()}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewName(''); setNewUnit('kg') }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddMaterial}
                disabled={adding || !newName.trim()}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {adding ? 'Đang thêm...' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      ) : notFound ? (
        <div className="flex flex-col items-center gap-2 rounded-[10px] border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-500">Không tìm thấy "{search}"</p>
          <button
            type="button"
            onClick={() => {
              setNewName(search.trim())
              setShowAddForm(true)
            }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            + Thêm nguyên liệu mới
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải kho nguyên liệu...</p>
      ) : (
        !showAddForm && (
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-[10px] border border-gray-200 p-2">
            {filtered.map((m) => {
              const selected = selectedIds.has(m.maNguyenLieu)
              return (
                <button
                  key={m.maNguyenLieu}
                  type="button"
                  onClick={() => toggleMaterial(m)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    selected
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{m.tenNguyenLieu}</span>
                  <span className="text-xs text-gray-500">
                    {m.soLuongTon} {m.donVi}
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 && !notFound && (
              <p className="px-2 py-4 text-center text-sm text-gray-400">
                Không có nguyên liệu nào.
              </p>
            )}
          </div>
        )
      )}
    </div>
  )
}
