import { paths } from '../routes/paths'

export const ProductParam = {
  CATEGORY: 'danhMuc',
  SEARCH: 'search',
  SORT: 'sort',
  PAGE: 'page',
}

/** @param {{ danhMuc?: string|number, search?: string, sort?: string, page?: number }} filters */
export function buildProductUrl(filters = {}) {
  const params = new URLSearchParams()
  if (filters.danhMuc) params.set(ProductParam.CATEGORY, String(filters.danhMuc))
  if (filters.search?.trim()) params.set(ProductParam.SEARCH, filters.search.trim())
  if (filters.sort && filters.sort !== 'newest') params.set(ProductParam.SORT, filters.sort)
  if (filters.page && filters.page > 1) params.set(ProductParam.PAGE, String(filters.page))

  const qs = params.toString()
  return qs ? `${paths.PRODUCTS}?${qs}` : paths.PRODUCTS
}

/** @param {URLSearchParams} searchParams */
export function parseProductParams(searchParams) {
  const page = Number(searchParams.get(ProductParam.PAGE)) || 1
  return {
    danhMuc: searchParams.get(ProductParam.CATEGORY) ?? '',
    search: searchParams.get(ProductParam.SEARCH) ?? '',
    sort: searchParams.get(ProductParam.SORT) ?? 'newest',
    page: page > 0 ? page : 1,
  }
}
