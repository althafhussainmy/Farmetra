import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import { Toaster } from 'react-hot-toast'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname])

  const mainPadding = isHome ? 'px-0 py-0' : 'px-4 sm:px-6 md:px-8 py-8'
  const contentShell = isHome ? 'w-full' : 'page-surface max-w-7xl mx-auto w-full p-6 sm:p-8'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 w-full ${mainPadding}`}>
        <div className={contentShell}>
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </div>
      </main>
      <Toaster position="top-right" reverseOrder={false} />
      <footer className="border-t border-white/20 bg-black/30 backdrop-blur py-4 text-center text-sm text-white">
        Farmetra Management System - Connecting farmers, workers & users
      </footer>
    </div>
  )
}
