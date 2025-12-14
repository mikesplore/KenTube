type PlaylistItem = {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
}

const KEY = 'kentube.playlist.v1'

function load(): PlaylistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(items: PlaylistItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {}
}

export const PlaylistStore = {
  get(): PlaylistItem[] { return load() },
  add(item: PlaylistItem) {
    const items = load()
    if (!items.find(i => i.id === item.id)) {
      items.push(item)
      save(items)
    }
    return items
  },
  remove(id: string) {
    const items = load().filter(i => i.id !== id)
    save(items)
    return items
  },
  clear() { save([]) }
}
