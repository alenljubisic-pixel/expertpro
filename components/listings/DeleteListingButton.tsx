'use client'

import { Trash2 } from 'lucide-react'

export default function DeleteListingButton({ action, listingId }: { action: (formData: FormData) => void; listingId: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Da li si siguran/na da želiš da obrišeš ovaj oglas? Ovo se ne može poništiti.')) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <button
        type="submit"
        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        title="Obriši"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  )
}
