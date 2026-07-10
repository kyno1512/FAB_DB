import { useState } from 'react'
import { getProductImageFallback } from '../../../../lib/productImage'

export default function ProductThumbnail({ src, name, categoryName, className = '' }) {
  const [failed, setFailed] = useState(false)

  const imageSrc = (failed || !src) 
    ? getProductImageFallback(name, categoryName) 
    : src

  return (
    <img
      src={imageSrc}
      alt={name}
      className={className}
      loading="lazy"
      onError={() => {
        if (!failed) setFailed(true)
      }}
    />
  )
}
