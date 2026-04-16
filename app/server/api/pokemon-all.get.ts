// Returns the full national dex name list (id + name only, no details)
// Single lightweight call — PokeAPI returns all 1025 in one shot
const BASE = 'https://pokeapi.co/api/v2'

export default defineEventHandler(async () => {
    const res = await $fetch<{ results: { name: string; url: string }[] }>(
        `${BASE}/pokemon?limit=1025&offset=0`
    )

    return res.results.map((p, i) => {
        const id = parseInt(p.url.split('/').filter(Boolean).pop() || String(i + 1))
        return { id, name: p.name }
    })
})