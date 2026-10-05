import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <p className="eyebrow">404 · Route not found</p>
      <h1>This trail does not appear on the Kanto map.</h1>
      <p>Return to the archive and choose another destination.</p>
      <Link className="primary-button" to="/">
        Return to the list
      </Link>
    </main>
  )
}

export default NotFoundPage
