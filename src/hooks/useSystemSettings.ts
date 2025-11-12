import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface SystemSettings {
  logo_url: string
  system_name: string
  company_name: string
}

const defaultSettings: SystemSettings = {
  logo_url: '/Black and White Modern Personal Brand Logo.png',
  system_name: 'Sistema Luiza',
  company_name: 'Igarashi'
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')

      if (error) {
        console.error('Erro ao carregar configurações:', error)
        setSettings(defaultSettings)
        return
      }

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.key as keyof SystemSettings] = item.value
          return acc
        }, {} as SystemSettings)

        setSettings({ ...defaultSettings, ...settingsMap })
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  return { settings, loading }
}
