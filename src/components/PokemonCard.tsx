import { Link } from 'react-router-dom'
import type { PokemonSummary } from '../types/pokemon'
import {
  formatPokemonName,
  formatPokemonNumber,
  getArtworkUrl,
} from '../utils/pokemon'

interface PokemonCardProps {
  pokemon: PokemonSummary
  to: string
}

function PokemonCard({ pokemon, to }: PokemonCardProps) {
  return (
    <Link className="pokemon-card" to={to}>
      <span className="card-number">{formatPokemonNumber(pokemon.id)}</span>
      <div className="artwork-frame">
        <img
          src={getArtworkUrl(pokemon.id)}
          alt={formatPokemonName(pokemon.name)}
          loading="lazy"
        />
      </div>
      <h2>{formatPokemonName(pokemon.name)}</h2>
      <span className="card-cta">View entry →</span>
    </Link>
  )
}

export default PokemonCard
