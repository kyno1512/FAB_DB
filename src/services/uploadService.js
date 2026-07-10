import axiosClient from '../lib/axiosClient'

export async function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)

  return axiosClient.post('/uploads/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function uploadNewsImages(files) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  return axiosClient.post('/uploads/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function uploadProductImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return axiosClient.post('/uploads/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
