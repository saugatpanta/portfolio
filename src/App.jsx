import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import Layout from './components/Layout.jsx'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Experience from './pages/Experience'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Admin from './pages/Admin'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/about" element={<Layout currentPageName="About"><About /></Layout>} />
          <Route path="/projects" element={<Layout currentPageName="Projects"><Projects /></Layout>} />
          <Route path="/experience" element={<Layout currentPageName="Experience"><Experience /></Layout>} />
          <Route path="/contact" element={<Layout currentPageName="Contact"><Contact /></Layout>} />
          <Route path="/blog" element={<Layout currentPageName="Blog"><Blog /></Layout>} />
          <Route path="/blog/post" element={<Layout currentPageName="BlogPost"><BlogPost /></Layout>} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
