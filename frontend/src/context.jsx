import { createContext, useCallback, useContext, useState } from 'react'

// Saved-properties heart (client-side only, same as the reference page) and the enquiry modal.
const UiContext = createContext(null)
export const useUi = () => useContext(UiContext)

export function UiProvider({ children }) {
  const [favs, setFavs] = useState(() => new Set())
  const [contactOpen, setContactOpen] = useState(false)

  const toggleFav = useCallback((id) => {
    setFavs((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  return (
    <UiContext.Provider
      value={{
        favs,
        toggleFav,
        contactOpen,
        openContact: () => setContactOpen(true),
        closeContact: () => setContactOpen(false),
      }}
    >
      {children}
    </UiContext.Provider>
  )
}
