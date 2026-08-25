'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import {
  Menu, X, Bell, MessageSquare, Plus, LogOut,
  User as UserIcon, Settings, ChevronDown, Zap
} from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ExpertPro</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/oglasi"
              className={`text-sm font-medium transition-colors ${pathname.startsWith('/oglasi') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Oglasi
            </Link>
            <Link
              href="/oglasi?type=urgent"
              className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              🚨 Hitno
            </Link>
            <Link
              href="/radnici"
              className={`text-sm font-medium transition-colors ${pathname.startsWith('/radnici') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Radnici
            </Link>
            <Link
              href="/blog"
              className={`text-sm font-medium transition-colors ${pathname.startsWith('/blog') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Blog
            </Link>
            <Link
              href="/faq"
              className={`text-sm font-medium transition-colors ${pathname.startsWith('/faq') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              FAQ
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* New Listing Button */}
                <Link
                  href="/oglasi/novi"
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novi oglas
                </Link>

                {/* Icons */}
                <Link href="/poruke" className="relative p-2 text-gray-500 hover:text-gray-700">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link href="/obaveštenja" className="relative p-2 text-gray-500 hover:text-gray-700">
                  <Bell className="w-5 h-5" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {profile?.avatar_url
                        ? <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        : <UserIcon className="w-4 h-4 text-blue-600" />
                      }
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{profile?.name || user.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{profile?.type}</p>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <UserIcon className="w-4 h-4" /> Moj profil
                      </Link>
                      <Link href="/dashboard/oglasi" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <Settings className="w-4 h-4" /> Moji oglasi
                      </Link>
                      {profile?.type === 'individual' && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                          <Settings className="w-4 h-4" /> Admin panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Odjavi se
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Prijava
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Registracija
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-500"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link href="/oglasi" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Oglasi</Link>
          <Link href="/oglasi?type=urgent" className="block text-sm font-medium text-red-600 py-2" onClick={() => setMenuOpen(false)}>🚨 Hitno</Link>
          <Link href="/radnici" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Radnici</Link>
          <Link href="/blog" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/faq" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>FAQ</Link>
          {user ? (
            <>
              <Link href="/oglasi/novi" className="block bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-medium" onClick={() => setMenuOpen(false)}>+ Novi oglas</Link>
              <Link href="/dashboard" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Moj profil</Link>
              <button onClick={handleSignOut} className="block w-full text-left text-sm font-medium text-red-600 py-2">Odjavi se</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Prijava</Link>
              <Link href="/register" className="block bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-medium" onClick={() => setMenuOpen(false)}>Registracija</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
