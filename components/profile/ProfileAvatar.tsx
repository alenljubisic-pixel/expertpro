'use client'

import Image from 'next/image'
import { Building2, UserRound } from 'lucide-react'
import { useState } from 'react'

type ProfileAvatarProps = {
  src?: string | null
  type?: string | null
  name?: string | null
  className?: string
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-800 ring-blue-200',
  'bg-emerald-100 text-emerald-800 ring-emerald-200',
  'bg-amber-100 text-amber-800 ring-amber-200',
  'bg-violet-100 text-violet-800 ring-violet-200',
  'bg-rose-100 text-rose-800 ring-rose-200',
  'bg-teal-100 text-teal-800 ring-teal-200',
]

export default function ProfileAvatar({ src, type, name, className = 'w-10 h-10' }: ProfileAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageSrc = src?.startsWith('https://') || (src?.startsWith('/') && !src.startsWith('//')) ? src : null
  const showImage = imageSrc && failedSrc !== imageSrc
  const initial = name?.trim().match(/\p{L}/u)?.[0]?.toLocaleUpperCase('sr-RS')
  const colorIndex = Array.from(name || type || '').reduce((sum, char) => sum + (char.codePointAt(0) || 0), 0) % AVATAR_COLORS.length

  return (
    <span className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ${AVATAR_COLORS[colorIndex]} ${className}`} role="img" aria-label={name ? `Profil: ${name}` : 'Profil korisnika'}>
      {showImage ? (
        <Image src={imageSrc} alt="" fill sizes="80px" unoptimized className="object-cover" onError={() => setFailedSrc(imageSrc)} />
      ) : initial ? (
        <span aria-hidden="true" className="text-sm font-bold">{initial}</span>
      ) : type === 'company' || type === 'agency' ? (
        <Building2 aria-hidden="true" className="h-1/2 w-1/2" />
      ) : (
        <UserRound aria-hidden="true" className="h-1/2 w-1/2" />
      )}
    </span>
  )
}
