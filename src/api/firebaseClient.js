import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Add your allowed email here
const ALLOWED_ADMIN_EMAILS = [
  'pantasaugat7@gmail.com',
  'saugatpanta123email@gmail.com'
]

// Toast notification function
const showToast = (message, type = 'error') => {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.custom-toast')
  existingToasts.forEach(toast => toast.remove())

  const toast = document.createElement('div')
  toast.className = `custom-toast custom-toast-${type}`
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `

  // Add styles if not already added
  if (!document.querySelector('#toast-styles')) {
    const styles = document.createElement('style')
    styles.id = 'toast-styles'
    styles.textContent = `
      .custom-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-left: 4px solid #e74c3c;
        animation: slideIn 0.3s ease-out;
      }
      
      .custom-toast-success {
        border-left-color: #27ae60;
      }
      
      .custom-toast-warning {
        border-left-color: #f39c12;
      }
      
      .custom-toast-info {
        border-left-color: #3498db;
      }
      
      .toast-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
      }
      
      .toast-message {
        flex: 1;
        color: #2c3e50;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .toast-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #7f8c8d;
        cursor: pointer;
        margin-left: 12px;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }
      
      .toast-close:hover {
        background: #f8f9fa;
        color: #2c3e50;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(styles)
  }

  document.body.appendChild(toast)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove()
    }
  }, 5000)
}

export const firebaseClient = {
  auth: {
    isAuthenticated: () => {
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, 
          (user) => {
            unsubscribe()
            try {
              const isAllowed = user && ALLOWED_ADMIN_EMAILS.includes(user.email)
              resolve(isAllowed)
            } catch (error) {
              console.error('Auth check error:', error)
              showToast('Authentication check failed', 'error')
              resolve(false)
            }
          },
          (error) => {
            console.error('Auth state error:', error)
            showToast('Authentication error occurred', 'error')
            reject(error)
          }
        )
      })
    },
    
    redirectToLogin: async (redirectUrl) => {
      const provider = new GoogleAuthProvider()
      
      // Add additional scopes if needed
      provider.addScope('email')
      provider.addScope('profile')
      
      try {
        const result = await signInWithPopup(auth, provider)
        const user = result.user
        
        console.log('Login successful, user email:', user.email)
        
        if (ALLOWED_ADMIN_EMAILS.includes(user.email)) {
          showToast('Login successful! Redirecting...', 'success')
          // Small delay to show success message
          setTimeout(() => {
            window.location.href = redirectUrl
          }, 1000)
        } else {
          await signOut(auth)
          showToast('Access denied. Only authorized administrators can access this panel.', 'warning')
        }
      } catch (error) {
        console.error('Login error details:', error)
        
        // Specific error handling
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            // User closed popup - no action needed
            showToast('Login cancelled', 'info')
            break
          case 'auth/popup-blocked':
            showToast('Popup was blocked. Please allow popups for this site and try again.', 'warning')
            break
          case 'auth/unauthorized-domain':
            showToast('This domain is not authorized. Please contact administrator.', 'error')
            break
          case 'auth/network-request-failed':
            showToast('Network error. Please check your internet connection.', 'error')
            break
          case 'auth/invalid-api-key':
            showToast('Configuration error. Please contact administrator.', 'error')
            break
          case 'auth/operation-not-allowed':
            showToast('Login method not enabled. Please contact administrator.', 'error')
            break
          default:
            showToast(`Login failed: ${error.message}`, 'error')
        }
      }
    },
    
    logout: async (redirectUrl) => {
      try {
        await signOut(auth)
        showToast('Logged out successfully', 'success')
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 1000)
      } catch (error) {
        console.error('Logout error:', error)
        showToast('Logout failed. Please try again.', 'error')
      }
    },

    // Helper method to check if current user is allowed
    isAllowedUser: () => {
      try {
        const user = auth.currentUser
        return user && ALLOWED_ADMIN_EMAILS.includes(user.email)
      } catch (error) {
        console.error('Error checking allowed user:', error)
        return false
      }
    },

    // Get current user info
    getCurrentUser: () => {
      return auth.currentUser
    }
  },

  entities: {
    Project: {
      list: (orderByField = 'order') => getCollection('projects', orderByField),
      filter: (filters, orderByField = 'order', limit = null) => getFilteredCollection('projects', filters, orderByField, limit),
      get: (id) => getDocument('projects', id),
      create: (data) => createDocument('projects', data),
      update: (id, data) => updateDocument('projects', id, data),
      delete: (id) => deleteDocument('projects', id)
    },
    
    Skill: {
      list: (orderByField = 'order') => getCollection('skills', orderByField),
      create: (data) => createDocument('skills', data),
      update: (id, data) => updateDocument('skills', id, data),
      delete: (id) => deleteDocument('skills', id)
    },
    
    Experience: {
      list: (orderByField = 'order') => getCollection('experience', orderByField),
      create: (data) => createDocument('experience', data),
      update: (id, data) => updateDocument('experience', id, data),
      delete: (id) => deleteDocument('experience', id)
    },
    
    Message: {
      list: (orderByField = 'created_date') => getCollection('messages', orderByField),
      create: (data) => createDocument('messages', data),
      delete: (id) => deleteDocument('messages', id)
    },
    
    BlogPost: {
      list: (orderByField = 'published_date') => getCollection('blog_posts', orderByField),
      filter: (filters, orderByField = 'published_date', limit = null) => getFilteredCollection('blog_posts', filters, orderByField, limit),
      get: (id) => getDocument('blog_posts', id),
      create: (data) => createDocument('blog_posts', data),
      update: (id, data) => updateDocument('blog_posts', id, data),
      delete: (id) => deleteDocument('blog_posts', id)
    }
  },

  // Utility function to show notifications from anywhere
  showNotification: showToast
}

// Enhanced helper functions with error handling
async function getCollection(collectionName, orderByField = 'created_date') {
  try {
    const [field, direction] = orderByField.startsWith('-') 
      ? [orderByField.slice(1), 'desc'] 
      : [orderByField, 'asc']
    
    const q = query(collection(db, collectionName), orderBy(field, direction))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      created_date: doc.data().created_date?.toDate?.() || new Date(),
      published_date: doc.data().published_date?.toDate?.() || new Date()
    }))
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error)
    showToast(`Failed to load ${collectionName}`, 'error')
    throw error
  }
}

async function getFilteredCollection(collectionName, filters, orderByField = 'created_date', limit = null) {
  try {
    const [field, direction] = orderByField.startsWith('-') 
      ? [orderByField.slice(1), 'desc'] 
      : [orderByField, 'asc']
    
    let q = query(collection(db, collectionName))
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      q = query(q, where(key, '==', value))
    })
    
    // Add ordering
    q = query(q, orderBy(field, direction))
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      created_date: doc.data().created_date?.toDate?.() || new Date(),
      published_date: doc.data().published_date?.toDate?.() || new Date()
    }))
  } catch (error) {
    console.error(`Error getting filtered collection ${collectionName}:`, error)
    showToast(`Failed to load ${collectionName}`, 'error')
    throw error
  }
}

async function getDocument(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { 
        id: docSnap.id, 
        ...docSnap.data(),
        created_date: docSnap.data().created_date?.toDate?.() || new Date(),
        published_date: docSnap.data().published_date?.toDate?.() || new Date()
      }
    }
    showToast('Document not found', 'warning')
    return null
  } catch (error) {
    console.error(`Error getting document ${collectionName}/${id}:`, error)
    showToast('Failed to load document', 'error')
    throw error
  }
}

async function createDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      created_date: new Date(),
      updated_date: new Date()
    })
    showToast(`${collectionName.slice(0, -1)} created successfully`, 'success')
    return { id: docRef.id, ...data }
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error)
    showToast(`Failed to create ${collectionName.slice(0, -1)}`, 'error')
    throw error
  }
}

async function updateDocument(collectionName, id, data) {
  try {
    const docRef = doc(db, collectionName, id)
    await updateDoc(docRef, {
      ...data,
      updated_date: new Date()
    })
    showToast(`${collectionName.slice(0, -1)} updated successfully`, 'success')
    return { id, ...data }
  } catch (error) {
    console.error(`Error updating document ${collectionName}/${id}:`, error)
    showToast(`Failed to update ${collectionName.slice(0, -1)}`, 'error')
    throw error
  }
}

async function deleteDocument(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id)
    await deleteDoc(docRef)
    showToast(`${collectionName.slice(0, -1)} deleted successfully`, 'success')
    return { id }
  } catch (error) {
    console.error(`Error deleting document ${collectionName}/${id}:`, error)
    showToast(`Failed to delete ${collectionName.slice(0, -1)}`, 'error')
    throw error
  }
}

// Export the showToast function for use in components
export { showToast }
