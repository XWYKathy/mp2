import { useEffect, useState } from 'react'
import { getPokemonList } from '../services/pokemonApi'
import type { PokemonSummary } from '../types/pokemon'

interface PokemonListState {
  pokemon: PokemonSummary[]
  loading: boolean
  error: string
}

export function usePokemonList(): PokemonListState {
  const [pokemon, setPokemon] = useState<PokemonSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getPokemonList()
      .then((results) => {
        if (active) {
          setPokemon(results)
        }
      })
      .catch(() => {
        if (active) {
          setError('The Pokédex could not be loaded. Please try again.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return { pokemon, loading, error }
}
