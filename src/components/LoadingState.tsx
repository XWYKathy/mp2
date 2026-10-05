interface LoadingStateProps {
  message?: string
}

function LoadingState({ message = 'Loading Pokémon…' }: LoadingStateProps) {
  return (
    <div className="status-panel" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

export default LoadingState
