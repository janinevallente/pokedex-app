import type { PokemonSummary, PokemonDetail } from '~/types/pokemon'

const BASE = 'https://pokeapi.co/api/v2'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 151
  const offset = Number(query.offset) || 0

  const listRes = await $fetch<{ results: { name: string }[] }>(
    `${BASE}/pokemon?limit=${limit}&offset=${offset}`
  )

  const details = await Promise.all(
    listRes.results.map(p => $fetch<PokemonDetail>(`${BASE}/pokemon/${p.name}`))
  )

  const summaries: PokemonSummary[] = details.map(d => ({
    id: d.id,
    name: d.name,
    types: d.types.map(t => t.type.name),
    sprite: d.sprites.other['official-artwork']?.front_default || d.sprites.front_default,
  }))

  return summaries
})
