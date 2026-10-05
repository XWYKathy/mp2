import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import PokemonCard from '../components/PokemonCard'
import { usePokemonList } from '../hooks/usePokemonList'
import {
  getPokemonIdsByType,
  getPokemonTypes,
} from '../services/pokemonApi'
import { formatPokemonName } from '../utils/pokemon'
import {
  buildPokemonDetailHref,
  createGalleryContext,
} from '../utils/pokemonCollection'

interface FilterResult {
  key: string
  ids: Set<number> | null
  error: string
}

function GalleryPage() {
  const { pokemon, loading, error } = usePokemonList()
  const [searchParams, setSearchParams] = useSearchParams()
  const [types, setTypes] = useState<string[]>([])
  const [typeListError, setTypeListError] = useState('')
  const [filterResult, setFilterResult] = useState<FilterResult>({
    key: '',
    ids: null,
    error: '',
  })
  const typeParameter = searchParams.get('types') ?? ''
  const selectedTypes = useMemo(() => {
    if (types.length === 0 || typeParameter === '') {
      return []
    }

    const requestedTypes = [...new Set(typeParameter.split(','))]
    return requestedTypes.filter((type) => types.includes(type))
  }, [typeParameter, types])
  const filterKey = selectedTypes.join(',')
  const galleryContext = useMemo(
    () => createGalleryContext(selectedTypes),
    [selectedTypes],
  )

  useEffect(() => {
    let active = true

    getPokemonTypes()
      .then((results) => {
        if (active) {
          setTypes(results)
        }
      })
      .catch(() => {
        if (active) {
          setTypeListError('Type filters could not be loaded.')
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    if (filterKey === '') {
      return () => {
        active = false
      }
    }

    const filterTypes = filterKey.split(',')

    Promise.all(filterTypes.map((type) => getPokemonIdsByType(type)))
      .then((idSets) => {
        if (!active) {
          return
        }

        const intersection = new Set(
          [...idSets[0]].filter((id) =>
            idSets.slice(1).every((idSet) => idSet.has(id)),
          ),
        )
        setFilterResult({ key: filterKey, ids: intersection, error: '' })
      })
      .catch(() => {
        if (active) {
          setFilterResult({
            key: filterKey,
            ids: null,
            error: 'That filter could not be applied. Please try again.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [filterKey])

  const filterLoading = filterKey !== '' && filterResult.key !== filterKey
  const filterError =
    filterResult.key === filterKey ? filterResult.error : ''

  const visiblePokemon = useMemo(() => {
    if (filterKey === '') {
      return pokemon
    }

    if (filterResult.key !== filterKey || filterResult.ids === null) {
      return []
    }

    return pokemon.filter((item) => filterResult.ids?.has(item.id))
  }, [filterKey, filterResult, pokemon])

  function updateTypeParameter(nextTypes: string[]) {
    const nextParams = new URLSearchParams(searchParams)

    if (nextTypes.length === 0) {
      nextParams.delete('types')
    } else {
      nextParams.set('types', nextTypes.join(','))
    }

    setSearchParams(nextParams, { replace: true })
  }

  function toggleType(type: string) {
    const nextTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((item) => item !== type)
      : [...selectedTypes, type]

    updateTypeParameter(nextTypes)
  }

  function clearFilters() {
    updateTypeParameter([])
  }

  return (
    <main>
      <section className="page-hero gallery-hero">
        <p className="eyebrow">Visual archive · Kanto region</p>
        <h1>Browse every silhouette.</h1>
        <p className="hero-copy">
          Select one or more types to find Pokémon that match every selected
          trait.
        </p>
      </section>

      <section className="content-section" aria-labelledby="gallery-heading">
        <div className="section-heading gallery-heading">
          <div>
            <p className="eyebrow">Gallery view</p>
            <h2 id="gallery-heading">Field specimens</h2>
          </div>
          {!loading && !error && (
            <p className="result-count" aria-live="polite">
              {filterLoading ? 'Filtering…' : `${visiblePokemon.length} shown`}
            </p>
          )}
        </div>

        <div className="filter-panel">
          <div className="filter-intro">
            <strong>Filter by type</strong>
            {selectedTypes.length > 0 && (
              <button
                className="text-button"
                type="button"
                onClick={clearFilters}
              >
                Clear all
              </button>
            )}
          </div>
          <div className="type-filters" aria-label="Pokémon type filters">
            {types.map((type) => (
              <button
                className={`type-filter type-${type}`}
                type="button"
                aria-pressed={selectedTypes.includes(type)}
                onClick={() => toggleType(type)}
                key={type}
              >
                {formatPokemonName(type)}
              </button>
            ))}
          </div>
        </div>

        {loading && <LoadingState message="Preparing the gallery…" />}
        {error && <p className="error-panel">{error}</p>}
        {typeListError && <p className="error-panel">{typeListError}</p>}
        {filterError && <p className="error-panel">{filterError}</p>}
        {!loading && !error && filterLoading && (
          <LoadingState message="Applying type filters…" />
        )}

        {!loading &&
          !error &&
          !filterLoading &&
          !filterError &&
          visiblePokemon.length === 0 && (
            <div className="empty-state">
              <p>No Kanto Pokémon have every selected type.</p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}

        {!loading && !error && visiblePokemon.length > 0 && (
          <div className="pokemon-grid">
            {visiblePokemon.map((item) => (
              <PokemonCard
                pokemon={item}
                to={buildPokemonDetailHref(item.id, galleryContext)}
                key={item.id}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default GalleryPage
