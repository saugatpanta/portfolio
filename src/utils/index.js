export const createPageUrl = (pageName) => {
  const routes = {
    Home: '/',
    About: '/about',
    Projects: '/projects',
    Experience: '/experience',
    Contact: '/contact',
    Blog: '/blog',
    BlogPost: '/blog/post',
    Admin: '/admin'
  }
  return routes[pageName] || '/'
}