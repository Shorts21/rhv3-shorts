import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface Unidade {
  id: string
  nome: string
  descricao: string
  ativo: boolean
}

interface Setor {
  id: string
  nome: string
  descricao: string
  ativo: boolean
}

export function useUnidades() {
  return useQuery({
    queryKey: ['unidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      return data as Unidade[]
    }
  })
}

export function useSetores() {
  return useQuery({
    queryKey: ['setores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      return data as Setor[]
    }
  })
}
