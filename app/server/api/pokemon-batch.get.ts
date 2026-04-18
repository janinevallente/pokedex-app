// Fetches full details for a batch of pokemon by IDs
import type { PokemonDetail, PokemonSummary } from '~/types/pokemon'
import { getVariantLabel, extractBaseName } from '~/types/pokemon'

const BASE = 'https://pokeapi.co/api/v2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const idsParam = String(query.ids || '')
  const baseIdsParam = String(query.baseIds || '')

  if (!idsParam) return []

  const ids = idsParam.split(',').map(Number).filter(Boolean).slice(0, 49)

  // baseIds is a parallel array: baseIds[i] is the baseId for ids[i] (0 if not a variant)
  const baseIds = baseIdsParam
    ? baseIdsParam.split(',').map(Number)
    : ids.map(() => 0)

  const details = await Promise.all(
    ids.map(id => $fetch<PokemonDetail>(`${BASE}/pokemon/${id}`))
  )

  const summaries: PokemonSummary[] = details.map((d, i) => {
    const variantLabel = getVariantLabel(d.name)
    const baseId = baseIds[i] || undefined
    return {
      id: d.id,
      name: d.name,
      types: d.types.map(t => t.type.name),
      sprite: d.sprites.other['official-artwork']?.front_default || d.sprites.front_default,
      isVariant: !!variantLabel,
      variantLabel,
      baseId,
    }
  })

  return summaries
})