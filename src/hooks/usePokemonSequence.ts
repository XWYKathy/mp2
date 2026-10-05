import { useEffect, useMemo, useState } from 'react'
import {
  getPokemonIdsByType,
  getPokemonList,
  getPokemonTypes,
  KANTO_POKEMON_COUNT,
} from '../services/pokemonApi'
import {
  buildDetailSearchParams,
  filterAndSortPokemon,
  type CollectionContext,
} from '../utils/pokemonCollection'

const DEFAULT_SEQUENCE = Array.from(
  { length: KANTO_POKEMON_COUNT },
  (_, index) => index + 1,
)

interface SequenceResult {
  key: string
  ids: number[]
}

interface PokemonSequenceState {
  ids: number[]
  loading: boolean
}

async function loadContextSequence(
  context: Exclude<CollectionContext, { source: 'default' }>,
): Promise<number[]> {
  const pokemon = await getPokemonList()

  if (context.source === 'list') {
    return filterAndSortPokemon(pokemon, context).map((item) => item.id)
  }

  if (context.types.length === 0) {
    return pokemon.map((item) => item.id)
  }

  const supportedTypes = await getPokemonTypes()
  const validTypes = context.types.filter((type) =>
    supportedTypes.includes(type),
  )

  if (validTypes.length === 0) {
    return pokemon.map((item) => item.id)
  }

  const idSets = await Promise.all(
    validTypes.map((type) => getPokemonIdsByType(type)),
  )
  return pokemon
    .filter((item) => idSets.every((idSet) => idSet.has(item.id)))
    .map((item) => item.id)
}

export function usePokemonSequence(
  context: CollectionContext,
  currentId: number,
): PokemonSequenceState {
  const contextKey = buildDetailSearchParams(context).toString()
  const [result, setResult] = useState<SequenceResult>({ key: '', ids: [] })

  useEffect(() => {
    let active = true

    if (context.source === 'default') {
      return () => {
        active = false
      }
    }

    loadContextSequence(context)
      .then((ids) => {
        if (active) {
          setResult({ key: contextKey, ids })
        }
      })
      .catch(() => {
        if (active) {
          setResult({ key: contextKey, ids: DEFAULT_SEQUENCE })
        }
      })

    return () => {
      active = false
    }
  }, [context, contextKey])

  return useMemo(() => {
    if (context.source === 'default') {
      return { ids: DEFAULT_SEQUENCE, loading: false }
    }

    if (result.key !== contextKey) {
      return { ids: DEFAULT_SEQUENCE, loading: true }
    }

    const ids =
      result.ids.length > 0 && result.ids.includes(currentId)
        ? result.ids
        : DEFAULT_SEQUENCE

    return { ids, loading: false }
  }, [context.source, contextKey, currentId, result])
}
