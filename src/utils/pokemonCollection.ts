import type { PokemonSummary } from '../types/pokemon'

export type SortProperty = 'id' | 'name'
export type SortOrder = 'asc' | 'desc'

export interface ListCollectionContext {
  source: 'list'
  query: string
  sortProperty: SortProperty
  sortOrder: SortOrder
}

export interface GalleryCollectionContext {
  source: 'gallery'
  types: string[]
}

export interface DefaultCollectionContext {
  source: 'default'
}

export type CollectionContext =
  | ListCollectionContext
  | GalleryCollectionContext
  | DefaultCollectionContext

export function parseListContext(
  searchParams: URLSearchParams,
): ListCollectionContext {
  return {
    source: 'list',
    query: searchParams.get('q') ?? '',
    sortProperty: searchParams.get('sort') === 'name' ? 'name' : 'id',
    sortOrder: searchParams.get('order') === 'desc' ? 'desc' : 'asc',
  }
}

export function createGalleryContext(
  types: string[],
): GalleryCollectionContext {
  return {
    source: 'gallery',
    types: [...new Set(types)],
  }
}

export function parseCollectionContext(
  searchParams: URLSearchParams,
): CollectionContext {
  const source = searchParams.get('from')

  if (source === 'list') {
    return parseListContext(searchParams)
  }

  if (source === 'gallery') {
    const types = (searchParams.get('types') ?? '')
      .split(',')
      .map((type) => type.trim().toLowerCase())
      .filter(Boolean)

    return createGalleryContext(types)
  }

  return { source: 'default' }
}

export function filterAndSortPokemon(
  pokemon: PokemonSummary[],
  context: ListCollectionContext,
): PokemonSummary[] {
  const normalizedQuery = context.query.trim().toLowerCase()
  const filtered = pokemon.filter(
    (item) =>
      item.name.includes(normalizedQuery) ||
      String(item.id).includes(normalizedQuery),
  )

  return filtered.sort((first, second) => {
    const comparison =
      context.sortProperty === 'name'
        ? first.name.localeCompare(second.name)
        : first.id - second.id

    return context.sortOrder === 'asc' ? comparison : -comparison
  })
}

function appendListParameters(
  searchParams: URLSearchParams,
  context: ListCollectionContext,
) {
  if (context.query !== '') {
    searchParams.set('q', context.query)
  }

  if (context.sortProperty !== 'id') {
    searchParams.set('sort', context.sortProperty)
  }

  if (context.sortOrder !== 'asc') {
    searchParams.set('order', context.sortOrder)
  }
}

export function buildDetailSearchParams(
  context: CollectionContext,
): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (context.source === 'list') {
    searchParams.set('from', 'list')
    appendListParameters(searchParams, context)
  }

  if (context.source === 'gallery') {
    searchParams.set('from', 'gallery')
    if (context.types.length > 0) {
      searchParams.set('types', context.types.join(','))
    }
  }

  return searchParams
}

export function buildPokemonDetailHref(
  id: number,
  context: CollectionContext,
): string {
  const query = buildDetailSearchParams(context).toString()
  return `/pokemon/${id}${query === '' ? '' : `?${query}`}`
}

export function buildCollectionSourceHref(context: CollectionContext): string {
  if (context.source === 'list') {
    const searchParams = new URLSearchParams()
    appendListParameters(searchParams, context)
    const query = searchParams.toString()
    return `/${query === '' ? '' : `?${query}`}`
  }

  if (context.source === 'gallery') {
    const searchParams = new URLSearchParams()
    if (context.types.length > 0) {
      searchParams.set('types', context.types.join(','))
    }
    const query = searchParams.toString()
    return `/gallery${query === '' ? '' : `?${query}`}`
  }

  return '/'
}
