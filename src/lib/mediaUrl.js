const PLACEHOLDER =
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop'

export function resolveMediaUrl(url) {
  if (!url?.trim()) return null
  const value = url.trim()
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/')) return value
  return `/${value}`
}

export function getNewsImageUrl(anhDaiDien) {
  return resolveMediaUrl(anhDaiDien) || PLACEHOLDER
}

export { PLACEHOLDER as NEWS_PLACEHOLDER_IMAGE }
