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
