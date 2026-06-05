import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import OSEnvironment from './components/os/OSEnvironment'
import Admin from './pages/Admin'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Admin route still accessible directly */}
          <Route path="/admin" element={<Admin />} />
          {/* Everything else goes through the OS environment */}
          <Route path="/*" element={<OSEnvironment />} />
        </Routes>
        <Toaster position="top-right" theme="dark" />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
