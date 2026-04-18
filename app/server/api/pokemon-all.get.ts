// Returns the full national dex name list (id + name + baseId for variants)
// Fetches base Pokémon (1–1025) then variants (10001+), resolving each variant's baseId so the client can group them beside their base form.
import { extractBaseName } from '~/types/pokemon'

const BASE = 'https://pokeapi.co/api/v2'

// const VARIANT_KEYWORDS = [
//   'mega', 'gmax', 'alola', 'galar', 'hisui', 'paldea',
//   'primal', 'origin', 'therian', 'eternamax'
// ]

const VARIANT_KEYWORDS = [
  'mega-x', 
  'mega-y', 
  'mega', 
  'gmax', 
  'alola', 
  'galar',
  'hisui', 
  'paldea', 
  'primal', 
  'origin', 
  'therian', 
  'eternamax',
  'black', 
  'white', 
  'sky',
  'heat',
  "wash",
  "frost",
  "fan",
  "mow",
  // "plant",
  // "sandy",
  // "trash",
  // "normal",
  // "attack",
  // "defense",
  // "speed",
  // "baile",
  // "pom-pom",
  // "pau",
  // "sensu",
  // "amped",
  // "low-key"
]

function isVariantName(name: string): boolean {
  const lower = name.toLowerCase()
  return VARIANT_KEYWORDS.some(kw => lower.includes(kw))
}

export default defineEventHandler(async () => {
  // Fetch base Pokémon (1–1025)
  const baseRes = await $fetch<{ count: number; results: { name: string; url: string }[] }>(
    `${BASE}/pokemon?limit=1025&offset=0`
  )

  const base = baseRes.results.map((p, i) => {
    const id = parseInt(p.url.split('/').filter(Boolean).pop() || String(i + 1))
    return { id, name: p.name, baseId: undefined as number | undefined }
  })

  // Build a lookup: species name → national dex id
  const nameToId = new Map<string, number>(base.map(p => [p.name.toLowerCase(), p.id]))

  // Fetch variant Pokémon (IDs 10001+)
  let variants: { id: number; name: string; baseId: number | undefined }[] = []
  try {
    const variantRes1 = await $fetch<{ count: number; results: { name: string; url: string }[] }>(
      `${BASE}/pokemon?limit=1000&offset=1025`
    )

    let allVariantResults = [...variantRes1.results]

    if (variantRes1.count > 1025 + 1000) {
      const variantRes2 = await $fetch<{ count: number; results: { name: string; url: string }[] }>(
        `${BASE}/pokemon?limit=1000&offset=2025`
      )
      allVariantResults = [...allVariantResults, ...variantRes2.results]
    }

    variants = allVariantResults
      .map(p => ({
        id: parseInt(p.url.split('/').filter(Boolean).pop() || '0'),
        name: p.name,
        baseId: undefined as number | undefined,
      }))
      .filter(p => p.id > 0 && isVariantName(p.name))
      .map(p => {
        // Resolve baseId: look up the base species name in nameToId
        const baseName = extractBaseName(p.name)
        const baseId = nameToId.get(baseName)
        return { ...p, baseId }
      })
      // Only keep variants whose base species we actually know
      .filter(p => p.baseId !== undefined)
  } catch (error) {
    console.error('Failed to fetch variants:', error)
  }

  // Group: base Pokémon sorted by id, with their variants injected right after
  // Build a map: baseId → variants[]
  const variantsByBase = new Map<number, typeof variants>()
  for (const v of variants) {
    const list = variantsByBase.get(v.baseId!) ?? []
    list.push(v)
    variantsByBase.set(v.baseId!, list)
  }

  const grouped: { id: number; name: string; baseId?: number }[] = []
  for (const b of base) {
    grouped.push(b)
    const bvariants = variantsByBase.get(b.id)
    if (bvariants) {
      grouped.push(...bvariants)
    }
  }

  return grouped
})