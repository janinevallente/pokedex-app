// Fetches full details for a batch of pokemon by IDs
import type { PokemonDetail, PokemonSummary } from '~/types/pokemon'

const BASE = 'https://pokeapi.co/api/v2'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const idsParam = String(query.ids || '')

    if (!idsParam) return []

    const ids = idsParam.split(',').map(Number).filter(Boolean).slice(0, 48)

    const details = await Promise.all(
        ids.map(id => $fetch<PokemonDetail>(`${BASE}/pokemon/${id}`))
    )

    const summaries: PokemonSummary[] = details.map(d => ({
        id: d.id,
        name: d.name,
        types: d.types.map(t => t.type.name),
        sprite: d.sprites.other['official-artwork']?.front_default || d.sprites.front_default,
    }))

    return summaries
})











