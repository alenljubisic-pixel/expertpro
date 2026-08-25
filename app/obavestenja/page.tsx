'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Bell, CheckCheck, MessageSquare, Star, AlertCircle, Clock, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  link?: string
}

const NOTIF_ICON: Record<string, { icon: any; color: string; bg: string }> = {
  new_message:      { icon: MessageSquare, color: 'text-blue-600',   bg: 'bg-blue-50' },
  new_review:       { icon: Star,          color: 'text-yellow-600', bg: 'bg-yellow-50' },
  listing_expired:  { icon: Clock,         color: 'text-orange-600', bg: 'bg-orange-50' },
  account_approved: { icon: UserCheck,     color: 'text-green-600',  bg: 'bg-green-50' },
  default:          { icon: Bell,          color: 'text-gray-600',   bg: 'bg-gray-50' },
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'malopre'
  if (diff < 3600) return `pre ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `pre ${Math.floor(diff / 3600)}h`
  return `pre ${Math.floor(diff / 86400)} dana`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data ?? [])
      setLoading(false)

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    }
    load()
  }, [])

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Obaveštenja</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{unreadCount} nepročitanih</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              Označi sve kao pročitano
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nema obaveštenja</p>
            <p className="text-sm text-gray-400 mt-1">Ovde ćeš videti poruke, ocene i sistemska obaveštenja.</p>
            <Link href="/oglasi" className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
              Pogledaj oglase
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => {
              const iconInfo = NOTIF_ICON[notif.type] ?? NOTIF_ICON.default
              const Icon = iconInfo.icon

              if (notif.link) {
                return (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors hover:shadow-sm ${
                      notif.is_read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconInfo.bg}`}>
                      <Icon className={`w-5 h-5 ${iconInfo.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</p>
                        {!notif.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      {notif.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>}
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                  </Link>
                )
              }

              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    notif.is_read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconInfo.bg}`}>
                    <Icon className={`w-5 h-5 ${iconInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</p>
                      {!notif.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    {notif.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
