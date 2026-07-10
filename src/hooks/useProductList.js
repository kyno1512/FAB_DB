import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PRODUCT_PAGE_SIZE } from '../constants/products'
import { getProductImageUrl } from '../lib/productImage'
import { parseProductParams } from '../lib/productUrls'
import { getProducts } from '../services/productService'

export function normalizeProduct(item) {
  return {
    id: item.maSanPham,
    name: item.tenSanPham,
    desc: item.moTa ?? '',
    price: item.giaBan,
    originalPrice: item.giaGoc,
    image: getProductImageUrl({
      hinhAnhChinh: item.hinhAnhChinh,
      tenSanPham: item.tenSanPham,
      tenDanhMuc: item.tenDanhMuc,
    }),
    categoryId: item.maDanhMuc,
    categoryName: item.tenDanhMuc,
    conHang: (item.conHang ?? item.ConHang) ?? true,
    coTheBan: (item.coTheBan ?? item.CoTheBan) ?? 999,
  }
}

export function useProductList() {
  const [searchParams] = useSearchParams()
  const filters = parseProductParams(searchParams)

  const [products, setProducts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProducts = useCallback(async (signal) => {
    setLoading(true)
    setError('')

    try {
      const data = await getProducts(
        {
          page: filters.page,
          pageSize: PRODUCT_PAGE_SIZE,
          search: filters.search || undefined,
          maDanhMuc: filters.danhMuc ? parseInt(filters.danhMuc, 10) : undefined,
          sort: filters.sort,
          trangThai: true,
        },
        { signal },
      )

      setProducts((data.items ?? []).map(normalizeProduct))
      setTotalCount(data.totalCount ?? 0)
      setTotalPages(data.totalPages ?? 0)
    } catch (err) {
      if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError' || err.name === 'AbortError') return
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters.danhMuc, filters.page, filters.search, filters.sort])

  useEffect(() => {
    const controller = new AbortController()
    fetchProducts(controller.signal)
    return () => controller.abort()
  }, [fetchProducts])

  return { filters, products, totalCount, totalPages, loading, error, reload: fetchProducts }
}
