import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isRHProfile(perfil: string): boolean {
  return ['rh', 'bp_rh'].includes(perfil)
}

export function isAdminProfile(perfil: string): boolean {
  return ['rh', 'bp_rh'].includes(perfil)
}

export function canEvaluate(perfil: string): boolean {
  return ['rh', 'bp_rh', 'supervisor'].includes(perfil)
}

export function formatDateForDB(dateValue: string | Date | undefined | null): string {
  if (!dateValue) {
    return new Date().toISOString().split('T')[0]
  }

  if (typeof dateValue === 'string') {
    if (dateValue.includes('T') || dateValue.includes('Z')) {
      return dateValue.split('T')[0]
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue
    }
  }

  if (dateValue instanceof Date) {
    const year = dateValue.getFullYear()
    const month = String(dateValue.getMonth() + 1).padStart(2, '0')
    const day = String(dateValue.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return String(dateValue).split('T')[0]
}
