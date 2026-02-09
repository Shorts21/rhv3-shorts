import { authService } from '../lib/auth'

export const feedbackPermissionService = {
  async canEditOrDelete(feedbackId: string, action: 'update' | 'delete'): Promise<boolean> {
    try {
      const currentUser = authService.getCurrentUser()
      if (!currentUser) return false

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-feedback`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          feedback_id: feedbackId,
          current_user_id: currentUser.id,
          user_perfil: currentUser.perfil,
        }),
      })

      const result = await response.json()
      return result.allowed === true
    } catch (error) {
      console.error('Erro ao validar permissão:', error)
      return false
    }
  },
}
