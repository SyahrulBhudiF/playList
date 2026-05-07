import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import './index.css'

// Import Layouts
import { ParticipantLayout } from './components/layout/ParticipantLayout'

// Import Pages
import { LandingPage } from './pages/LandingPage'
import { ParticipantPage } from './pages/ParticipantPage'
import { MusicRoom } from './pages/MusicRoom'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminHubPage } from './pages/AdminHubPage'

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
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLoginPage,
})

const adminHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminHubPage,
})

const adminRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/$roomId',
  component: AdminDashboardPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute, 
  participantBaseRoute.addChildren([participantIndexRoute, participantRequestRoute]),
  adminLoginRoute,
  adminHubRoute,
  adminRoomRoute
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
