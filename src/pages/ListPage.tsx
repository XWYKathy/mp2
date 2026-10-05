import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { usePokemonList } from '../hooks/usePokemonList'
import {
  formatPokemonName,
  formatPokemonNumber,
  getArtworkUrl,
} from '../utils/pokemon'
import {
  buildPokemonDetailHref,
  filterAndSortPokemon,
  type ListCollectionContext,
  type SortOrder,
  type SortProperty,
} from '../utils/pokemonCollection'

function ListPage() {
  const { pokemon, loading, error } = usePokemonList()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const sortProperty: SortProperty =
    searchParams.get('sort') === 'name' ? 'name' : 'id'
  const sortOrder: SortOrder =
    searchParams.get('order') === 'desc' ? 'desc' : 'asc'
  const listContext = useMemo<ListCollectionContext>(
    () => ({
      source: 'list',
      query,
      sortProperty,
      sortOrder,
    }),
    [query, sortOrder, sortProperty],
  )

  const visiblePokemon = useMemo(
    () => filterAndSortPokemon(pokemon, listContext),
    [listContext, pokemon],
  )

  function updateSearch(nextQuery: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (nextQuery === '') {
      nextParams.delete('q')
    } else {
      nextParams.set('q', nextQuery)
    }

    setSearchParams(nextParams, { replace: true })
  }

  function updateSortProperty(nextProperty: SortProperty) {
    const nextParams = new URLSearchParams(searchParams)

    if (nextProperty === 'id') {
      nextParams.delete('sort')
    } else {
      nextParams.set('sort', nextProperty)
    }

    setSearchParams(nextParams, { replace: true })
  }

  function updateSortOrder(nextOrder: SortOrder) {
    const nextParams = new URLSearchParams(searchParams)

    if (nextOrder === 'asc') {
      nextParams.delete('order')
    } else {
      nextParams.set('order', nextOrder)
    }

    setSearchParams(nextParams, { replace: true })
  }

  return (
    <main>
      <section className="page-hero list-hero">
        <p className="eyebrow">Research archive · 001–151</p>
        <h1>Meet the original Pokémon.</h1>
        <p className="hero-copy">
          Search the Kanto index, change the order, and open any field entry
          for detailed observations.
        </p>
      </section>

      <section className="content-section" aria-labelledby="list-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">List view</p>
            <h2 id="list-heading">Kanto index</h2>
          </div>
          {!loading && !error && (
            <p className="result-count" aria-live="polite">
              {visiblePokemon.length}{' '}
              {visiblePokemon.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        <div className="list-controls">
          <label className="search-control">
            <span>Search by name or number</span>
            <input
              type="search"
              value={query}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Try “Pikachu” or “25”"
            />
          </label>

          <label>
            <span>Sort by</span>
            <select
              value={sortProperty}
              onChange={(event) =>
                updateSortProperty(event.target.value as SortProperty)
              }
            >
              <option value="id">Pokédex number</option>
              <option value="name">Name</option>
            </select>
          </label>

          <label>
            <span>Order</span>
            <select
              value={sortOrder}
              onChange={(event) =>
                updateSortOrder(event.target.value as SortOrder)
              }
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        {loading && <LoadingState />}
        {error && <p className="error-panel">{error}</p>}

        {!loading && !error && visiblePokemon.length === 0 && (
          <div className="empty-state">
            <p>No Pokémon match “{query}”.</p>
            <button type="button" onClick={() => updateSearch('')}>
              Clear search
            </button>
          </div>
        )}

        {!loading && !error && visiblePokemon.length > 0 && (
          <ul className="pokemon-list">
            {visiblePokemon.map((item) => (
              <li key={item.id}>
                <Link to={buildPokemonDetailHref(item.id, listContext)}>
                  <span className="list-number">
                    {formatPokemonNumber(item.id)}
                  </span>
                  <img
                    src={getArtworkUrl(item.id)}
                    alt=""
                    loading="lazy"
                  />
                  <strong>{formatPokemonName(item.name)}</strong>
                  <span className="list-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default ListPage
