import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import ScrollManager from './components/ScrollManager'
import DetailPage from './pages/DetailPage'
import GalleryPage from './pages/GalleryPage'
import ListPage from './pages/ListPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <ScrollManager />
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/pokemon/:id" element={<DetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="site-footer">
        <p>Built with PokéAPI · Kanto entries 001–151</p>
      </footer>
    </div>
  )
}

export default App
