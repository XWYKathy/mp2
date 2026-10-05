import axios from 'axios'
import type {
  PokemonDetail,
  PokemonListResponse,
  PokemonSummary,
  PokemonTypeResponse,
  TypeListResponse,
} from '../types/pokemon'

const KANTO_POKEMON_COUNT = 151

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 10_000,
})

let pokemonListRequest: Promise<PokemonSummary[]> | undefined
let typeListRequest: Promise<string[]> | undefined
const typePokemonRequests = new Map<string, Promise<Set<number>>>()

function getIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean)
  return Number(parts.at(-1))
}

export function getPokemonList(): Promise<PokemonSummary[]> {
  if (!pokemonListRequest) {
    pokemonListRequest = api
      .get<PokemonListResponse>('/pokemon', {
        params: { limit: KANTO_POKEMON_COUNT },
      })
      .then(({ data }) =>
        data.results.map((pokemon) => ({
          ...pokemon,
          id: getIdFromUrl(pokemon.url),
        })),
      )
      .catch((error: unknown) => {
        pokemonListRequest = undefined
        throw error
      })
  }

  return pokemonListRequest
}

export async function getPokemon(id: number): Promise<PokemonDetail> {
  const { data } = await api.get<PokemonDetail>(`/pokemon/${id}`)
  return data
}

export function getPokemonTypes(): Promise<string[]> {
  if (!typeListRequest) {
    typeListRequest = api
      .get<TypeListResponse>('/type', { params: { limit: 18 } })
      .then(({ data }) => data.results.map((type) => type.name))
      .catch((error: unknown) => {
        typeListRequest = undefined
        throw error
      })
  }

  return typeListRequest
}

export function getPokemonIdsByType(type: string): Promise<Set<number>> {
  const cachedRequest = typePokemonRequests.get(type)

  if (cachedRequest) {
    return cachedRequest
  }

  const request = api
    .get<PokemonTypeResponse>(`/type/${encodeURIComponent(type)}`)
    .then(({ data }) => {
      const ids = data.pokemon
        .map(({ pokemon }) => getIdFromUrl(pokemon.url))
        .filter((id) => id >= 1 && id <= KANTO_POKEMON_COUNT)

      return new Set(ids)
    })
    .catch((error: unknown) => {
      typePokemonRequests.delete(type)
      throw error
    })

  typePokemonRequests.set(type, request)
  return request
}

export { KANTO_POKEMON_COUNT }
