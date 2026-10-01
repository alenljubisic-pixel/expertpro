self.addEventListener('push', (event) => {
  if (!event.data) return
  let data
  try { data = event.data.json() } catch { return }
  const url = typeof data.url === 'string' && data.url.startsWith('/') && !data.url.startsWith('//')
    ? data.url : '/obavestenja'
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of windows) client.postMessage({ type: 'expertpro-push' })
    if (windows.some(client => client.focused)) return
    await self.registration.showNotification(String(data.title || 'ExpertPro').slice(0, 120), {
      body: String(data.body || 'Imaš novo obaveštenje.').slice(0, 180),
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: String(data.tag || 'expertpro'),
      data: { url },
    })
  })())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const path = event.notification.data?.url || '/obavestenja'
  const target = new URL(path, self.location.origin).href
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin)) {
        await client.focus()
        await client.navigate(target)
        return
      }
    }
    await self.clients.openWindow(target)
  })())
})
