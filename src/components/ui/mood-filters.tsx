"use client"

import { Button } from '@/components/ui/button'

const MOODS = [
  { key: 'soft', label: 'Soft' },
  { key: 'party', label: 'Party' },
  { key: 'chill', label: 'Chill' },
  { key: 'upbeat', label: 'Upbeat' },
  { key: 'acoustic', label: 'Acoustic' },
]

export default function MoodFilters({ selected, onSelect }: { selected?: string; onSelect: (mood: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map(m => (
        <Button key={m.key} variant={selected === m.key ? 'default' : 'secondary'} size="sm" onClick={() => onSelect(m.key)}>
          {m.label}
        </Button>
      ))}
    </div>
  )
}
