import { useEffect, useState } from 'react'
import { mapListProduct } from '../lib/mapProduct'
import { getProductReviews, getProducts } from '../services/productService'

function loadHomeProducts() {
  return getProducts({
    page: 1,
    pageSize: 12,
    trangThai: true,
    sort: 'newest',
  }).then((data) => (data.items ?? []).map(mapListProduct))
}

export function useHomeProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHomeProducts()
      .then((items) => setProducts(items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return { products, loading }
}

export async function fetchFeaturedReviews(products, limit = 3) {
  const picks = products.slice(0, 6)
  const pages = await Promise.all(
    picks.map((p) =>
      getProductReviews(p.id, { page: 1, pageSize: 1 }).catch(() => null),
    ),
  )

  const reviews = []
  pages.forEach((page, index) => {
    const item = page?.items?.[0]
    if (!item) return
    reviews.push({
      id: item.maDanhGia,
      name: item.hoTen,
      rating: item.diem,
      content: item.noiDung,
      productName: picks[index].name,
    })
  })

  return reviews.slice(0, limit)
}
