import Image from 'next/image'
import { Building2, UserRound } from 'lucide-react'

type ProfileAvatarProps = {
  src?: string | null
  type?: string | null
  name?: string | null
  className?: string
}

export default function ProfileAvatar({ src, type, name, className = 'w-10 h-10' }: ProfileAvatarProps) {
  return (
    <span className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 ring-1 ring-blue-200 ${className}`}>
      {src ? (
        <Image src={src} alt={name ? `Slika profila: ${name}` : 'Slika profila'} fill sizes="80px" unoptimized className="object-cover" />
      ) : type === 'company' || type === 'agency' ? (
        <Building2 aria-label="Profil bez slike" className="h-1/2 w-1/2" />
      ) : (
        <UserRound aria-label="Profil bez slike" className="h-1/2 w-1/2" />
      )}
    </span>
  )
}
