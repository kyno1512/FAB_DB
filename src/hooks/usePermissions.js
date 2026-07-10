import { useState, useEffect } from 'react'
import { getStaffModulePermissions } from '../services/staffAdminService'
import { getUser } from '../lib/authStorage'

// Cache permissions trong memory
let permissionsCache = null
let cacheMaNguoiDung = null

export function clearPermissionsCache() {
  permissionsCache = null
  cacheMaNguoiDung = null
}

export function usePermissions() {
  const [permissions, setPermissions] = useState(permissionsCache)
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const user = getUser()

  useEffect(() => {
    // Nếu user là Admin thì không cần load permissions
    if (user?.tenVaiTro === 'Admin') {
      setIsAdmin(true)
      setPermissions(null)
      return
    }

    // Nếu đã cache cho user này thì dùng cache
    if (cacheMaNguoiDung === user?.maNguoiDung && permissionsCache) {
      setPermissions(permissionsCache)
      return
    }

    // Load permissions từ API
    async function loadPermissions() {
      if (!user?.maNguoiDung) return

      setLoading(true)
      try {
        const data = await getStaffModulePermissions(user.maNguoiDung)
        permissionsCache = data?.permissions ?? []
        cacheMaNguoiDung = user.maNguoiDung
        setPermissions(permissionsCache)
        setIsAdmin(data?.isAdmin === true)
        
        // DEBUG: Log all modules
        const enabledModules = [...new Set(permissionsCache.filter(p => !p.tat).map(p => p.module))]
        console.log('DEBUG Permissions:', {
          totalPermissions: permissionsCache.length,
          enabledModules,
          allModules: [...new Set(permissionsCache.map(p => p.module))]
        })
      } catch (err) {
        console.error('Lỗi load permissions:', err)
        setPermissions([])
      } finally {
        setLoading(false)
      }
    }

    loadPermissions()
  }, [user?.maNguoiDung, user?.tenVaiTro])

  // Kiểm tra module có được bật không (ít nhất 1 permission trong module không bị tắt)
  function hasModule(moduleName) {
    if (isAdmin) return true
    if (!permissions || permissions.length === 0) return false
    return permissions.some(
      (p) => p.module === moduleName && !p.tat
    )
  }

  return {
    permissions,
    loading,
    isAdmin,
    hasModule,
  }
}
