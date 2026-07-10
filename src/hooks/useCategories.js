import { useEffect, useState } from 'react'
import { getCategories } from '../services/categoryService'

let cache = null

export function useCategories() {
  const [categories, setCategories] = useState(cache ?? [])
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return

    getCategories({ activeOnly: true })
      .then((data) => {
        cache = data
        setCategories(data)
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  function findById(id) {
    if (!id) return null
    return categories.find((c) => String(c.maDanhMuc) === String(id)) ?? null
  }

  return { categories, loading, findById }
}
