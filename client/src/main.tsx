import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
} from '@tanstack/react-router'
import './index.css'

// Import Layouts
import { ParticipantLayout } from './components/layout/ParticipantLayout'

// Import Pages
import { LandingPage } from './pages/LandingPage'
import { ParticipantPage } from './pages/ParticipantPage'
import { MusicRoom } from './pages/MusicRoom'
import { AdminDashboardPage } from './pages/AdminDashboardPage'

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-[#fcfcfc] selection:bg-orange-500 selection:text-white">
      <Outlet />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

// --- PARTICIPANT ROUTES ---
const participantBaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/r/$roomId',
  component: ParticipantLayout,
})

const participantRequestRoute = createRoute({
  getParentRoute: () => participantBaseRoute,
  path: '/request',
  component: ParticipantPage,
})

const participantIndexRoute = createRoute({
  getParentRoute: () => participantBaseRoute,
  path: '/',
  component: MusicRoom,
})


// --- ADMIN ROUTES ---
const adminBaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/$roomId',
  component: AdminDashboardPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute, 
  participantBaseRoute.addChildren([participantIndexRoute, participantRequestRoute]),
  adminBaseRoute
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
