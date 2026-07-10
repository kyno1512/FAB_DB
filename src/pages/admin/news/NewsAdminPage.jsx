import { useEffect, useMemo, useState } from 'react'
import AdminTableActions, { AdminDeleteButton } from '../../../components/AdminTableActions'
import { useDebounce } from '../../../hooks/useDebounce'
import { confirmAction, showError, showSuccess } from '../../../lib/swal'
import { IconSearch } from '../dashboard/components/adminIcons'
import MenuPagination from '../menu/components/MenuPagination'
import {
  createNews,
  deleteManyNews,
  deleteNews,
  getAdminNews,
  updateNews,
} from '../../../services/newsAdminService'
import { getNewsImageUrl } from '../../../lib/mediaUrl'
import NewsFormModal from './components/NewsFormModal'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const STATUS_META = {
  DangDang: { label: 'Đang đăng', className: 'bg-emerald-100 text-emerald-800' },
  Nhap: { label: 'Nháp', className: 'bg-gray-100 text-gray-700' },
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('vi-VN')
}

export default function NewsAdminPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [modalPost, setModalPost] = useState(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleting, setDeleting] = useState(false)
  const debouncedSearch = useDebounce(search.trim(), 250)

  const fetchPosts = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminNews(debouncedSearch || undefined)
      setPosts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [debouncedSearch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedPosts = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return posts.slice(start, start + pageSize)
  }, [posts, safePage, pageSize])

  const pageIds = pagedPosts.map((post) => post.maTinTuc)
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id))

  function toggleAllPage() {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)))
      return
    }
    setSelectedIds((prev) => [...new Set([...prev, ...pageIds])])
  }

  async function handleSubmit(payload) {
    if (modalPost) {
      await updateNews(modalPost.maTinTuc, payload)
      await showSuccess('Đã cập nhật bài viết.')
    } else {
      await createNews(payload)
      await showSuccess('Đã đăng bài viết mới.')
    }
    setModalOpen(false)
    await fetchPosts()
  }

  async function handleDelete(post) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa "${post.tieuDe}"?`,
      text: 'Bài viết sẽ bị xóa vĩnh viễn.',
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    await deleteNews(post.maTinTuc)
    await showSuccess('Đã xóa bài viết.')
    await fetchPosts()
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa ${selectedIds.length} bài viết?`,
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    setDeleting(true)
    try {
      const count = selectedIds.length
      await deleteManyNews(selectedIds)
      setSelectedIds([])
      await showSuccess(`Đã xóa ${count} bài viết.`)
      await fetchPosts()
    } catch (err) {
      await showError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800">Quản lý tin tức</h2>
        <p className="mt-1 text-sm text-gray-500">Viết, chỉnh sửa và đăng bài lên trang Tin tức Flygo.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-4 sm:p-5">
          <label className="flex min-h-[42px] min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <IconSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tiêu đề, danh mục..."
              className="w-full border-none text-sm outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setModalPost(undefined)
              setModalOpen(true)
            }}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            + Viết bài mới
          </button>

          {selectedIds.length > 0 && (
            <AdminDeleteButton count={selectedIds.length} loading={deleting} onClick={handleDeleteSelected} />
          )}
        </div>

        {error && <p className="px-5 pt-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Đang tải bài viết...</p>
        ) : posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">Chưa có bài viết nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleAllPage} aria-label="Chọn tất cả" />
                  </th>
                  <th className="w-16 px-3 py-3">Ảnh</th>
                  <th className="px-4 py-3">Tiêu đề</th>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3">Ngày đăng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedPosts.map((post) => {
                  const status = STATUS_META[post.trangThai] ?? STATUS_META.Nhap
                  return (
                    <tr key={post.maTinTuc} className="hover:bg-gray-50/80">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(post.maTinTuc)}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(post.maTinTuc)
                                ? prev.filter((id) => id !== post.maTinTuc)
                                : [...prev, post.maTinTuc],
                            )
                          }
                        />
                      </td>
                      <td className="px-3 py-3">
                        <img
                          src={getNewsImageUrl(post.anhDaiDien)}
                          alt={post.tieuDe}
                          className="size-12 rounded-lg object-cover ring-1 ring-gray-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{post.tieuDe}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{post.tomTat}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{post.danhMuc}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(post.ngayDang)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <AdminTableActions
                            onEdit={() => {
                              setModalPost(post)
                              setModalOpen(true)
                            }}
                            onDelete={() => handleDelete(post)}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="border-t border-gray-100 p-4">
            <MenuPagination
              page={safePage}
              totalPages={totalPages}
              totalCount={posts.length}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
              itemLabel="bài viết"
            />
          </div>
        )}
      </div>

      <NewsFormModal
        open={modalOpen}
        post={modalPost}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
