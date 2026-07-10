import axiosClient from '../lib/axiosClient'

export function getPublishedNews() {
  return axiosClient.get('/news')
}
