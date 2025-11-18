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

export const firebaseClient = {
  auth: {
    isAuthenticated: () => {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe()
          // Check if user is authenticated AND has allowed email
          const isAllowed = user && ALLOWED_ADMIN_EMAILS.includes(user.email)
          resolve(isAllowed)
        })
      })
    },
    
    redirectToLogin: (redirectUrl) => {
      const provider = new GoogleAuthProvider()
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user
          // Check if the logged-in user's email is allowed
          if (ALLOWED_ADMIN_EMAILS.includes(user.email)) {
            window.location.href = redirectUrl
          } else {
            // If not allowed, sign them out and show error
            signOut(auth)
            alert('Access denied. Only authorized administrators can access this panel.')
          }
        })
        .catch((error) => {
          console.error('Login error:', error)
          if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup, no action needed
          } else {
            alert('Login failed. Please try again.')
          }
        })
    },
    
    logout: (redirectUrl) => {
      signOut(auth).then(() => {
        window.location.href = redirectUrl
      })
    },

    // Helper method to check if current user is allowed
    isAllowedUser: () => {
      const user = auth.currentUser
      return user && ALLOWED_ADMIN_EMAILS.includes(user.email)
    }
  },

  entities: {
    // ... your existing entity methods remain the same
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
  }
}

// Helper functions remain the same...
async function getCollection(collectionName, orderByField = 'created_date') {
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
}

async function getFilteredCollection(collectionName, filters, orderByField = 'created_date', limit = null) {
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
}

async function getDocument(collectionName, id) {
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
  return null
}

async function createDocument(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    created_date: new Date(),
    updated_date: new Date()
  })
  return { id: docRef.id, ...data }
}

async function updateDocument(collectionName, id, data) {
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, {
    ...data,
    updated_date: new Date()
  })
  return { id, ...data }
}

async function deleteDocument(collectionName, id) {
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
  return { id }
}