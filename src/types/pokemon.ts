export interface NamedApiResource {
  name: string
  url: string
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: NamedApiResource[]
}

export interface PokemonSummary extends NamedApiResource {
  id: number
}

export interface PokemonDetail {
  id: number
  name: string
  base_experience: number | null
  height: number
  weight: number
  abilities: Array<{
    ability: NamedApiResource
    is_hidden: boolean
    slot: number
  }>
  sprites: {
    front_default: string | null
    other: {
      'official-artwork': {
        front_default: string | null
      }
    }
  }
  stats: Array<{
    base_stat: number
    effort: number
    stat: NamedApiResource
  }>
  types: Array<{
    slot: number
    type: NamedApiResource
  }>
}

export interface TypeListResponse {
  results: NamedApiResource[]
}

export interface PokemonTypeResponse {
  pokemon: Array<{
    pokemon: NamedApiResource
    slot: number
  }>
}
