import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { usePokemonSequence } from '../hooks/usePokemonSequence'
import { getPokemon, KANTO_POKEMON_COUNT } from '../services/pokemonApi'
import type { PokemonDetail } from '../types/pokemon'
import {
  formatPokemonName,
  formatPokemonNumber,
  getArtworkUrl,
} from '../utils/pokemon'
import {
  buildCollectionSourceHref,
  buildPokemonDetailHref,
  parseCollectionContext,
} from '../utils/pokemonCollection'

function DetailPage() {
  const { id: routeId } = useParams()
  const [searchParams] = useSearchParams()
  const id = Number(routeId)
  const isValidId = Number.isInteger(id) && id >= 1 && id <= KANTO_POKEMON_COUNT
  const contextKey = searchParams.toString()
  const collectionContext = useMemo(
    () => parseCollectionContext(new URLSearchParams(contextKey)),
    [contextKey],
  )
  const backHref = buildCollectionSourceHref(collectionContext)
  const backLabel =
    collectionContext.source === 'gallery'
      ? 'Back to gallery'
      : 'Back to index'
  const { ids: sequenceIds, loading: sequenceLoading } = usePokemonSequence(
    collectionContext,
    id,
  )
  const [result, setResult] = useState<{
    id: number
    pokemon: PokemonDetail | null
    error: string
  }>({ id: 0, pokemon: null, error: '' })

  useEffect(() => {
    let active = true

    if (!isValidId) {
      return () => {
        active = false
      }
    }

    getPokemon(id)
      .then((result) => {
        if (active) {
          setResult({ id, pokemon: result, error: '' })
        }
      })
      .catch(() => {
        if (active) {
          setResult({
            id,
            pokemon: null,
            error: 'This Pokémon entry could not be loaded.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [id, isValidId])

  const loading = isValidId && result.id !== id
  const pokemon = result.id === id ? result.pokemon : null
  const error = result.id === id ? result.error : ''
  const sequenceIndex = Math.max(0, sequenceIds.indexOf(id))
  const previousId =
    sequenceIds[(sequenceIndex - 1 + sequenceIds.length) % sequenceIds.length]
  const nextId = sequenceIds[(sequenceIndex + 1) % sequenceIds.length]

  if (!isValidId) {
    return (
      <main className="not-found-page">
        <p className="eyebrow">Entry not found</p>
        <h1>That Pokédex number is outside the Kanto archive.</h1>
        <Link className="primary-button" to={backHref}>
          {backLabel}
        </Link>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="detail-status">
        <LoadingState message="Opening field entry…" />
      </main>
    )
  }

  if (error || !pokemon) {
    return (
      <main className="detail-status">
        <p className="error-panel">{error || 'Pokémon not found.'}</p>
        <Link className="primary-button" to={backHref}>
          {backLabel}
        </Link>
      </main>
    )
  }

  const artwork =
    pokemon.sprites.other['official-artwork'].front_default ??
    pokemon.sprites.front_default ??
    getArtworkUrl(pokemon.id)

  return (
    <main className="detail-page">
      <Link className="back-link" to={backHref}>
        ← {backLabel}
      </Link>

      <article className="detail-card">
        <div className="detail-artwork">
          <span className="detail-number">
            {formatPokemonNumber(pokemon.id)}
          </span>
          <img src={artwork} alt={formatPokemonName(pokemon.name)} />
        </div>

        <div className="detail-content">
          <p className="eyebrow">Pokédex field entry</p>
          <h1>{formatPokemonName(pokemon.name)}</h1>

          <div className="type-badges" aria-label="Types">
            {pokemon.types.map(({ type }) => (
              <span className={`type-badge type-${type.name}`} key={type.name}>
                {formatPokemonName(type.name)}
              </span>
            ))}
          </div>

          <dl className="fact-grid">
            <div>
              <dt>Height</dt>
              <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
            </div>
            <div>
              <dt>Base experience</dt>
              <dd>{pokemon.base_experience ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt>Abilities</dt>
              <dd>
                {pokemon.abilities
                  .map(({ ability }) => formatPokemonName(ability.name))
                  .join(', ')}
              </dd>
            </div>
          </dl>

          <section className="stats-section" aria-labelledby="stats-heading">
            <h2 id="stats-heading">Base stats</h2>
            <dl className="stats-list">
              {pokemon.stats.map(({ base_stat: value, stat }) => (
                <div key={stat.name}>
                  <dt>{formatPokemonName(stat.name)}</dt>
                  <dd>
                    <strong>{value}</strong>
                    <progress value={value} max="180">
                      {value}
                    </progress>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </article>

      <nav className="entry-navigation" aria-label="Pokédex entry navigation">
        {sequenceLoading ? (
          <>
            <span className="disabled-entry-link">Loading previous…</span>
            <span className="disabled-entry-link">Loading next…</span>
          </>
        ) : (
          <>
            <Link to={buildPokemonDetailHref(previousId, collectionContext)}>
              <span>← Previous</span>
              <strong>{formatPokemonNumber(previousId)}</strong>
            </Link>
            <Link to={buildPokemonDetailHref(nextId, collectionContext)}>
              <span>Next →</span>
              <strong>{formatPokemonNumber(nextId)}</strong>
            </Link>
          </>
        )}
      </nav>
    </main>
  )
}

export default DetailPage
