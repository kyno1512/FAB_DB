import axiosClient from '../lib/axiosClient'

export async function getChatStatus() {
  return axiosClient.get('/chat/status')
}

export async function sendChatMessage({ message, sessionId, maNguoiDung }) {
  return axiosClient.post('/chat', { message, sessionId, maNguoiDung })
}
