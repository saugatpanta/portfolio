// Cloudinary client-side upload utilities
// Using direct API calls instead of the Cloudinary SDK to avoid Node.js dependencies

// Upload image to Cloudinary using unsigned upload
export const uploadToCloudinary = async (file) => {
  try {
    console.log('Starting Cloudinary upload...', file.name);
    
    // Validate environment variables
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing. Please check your environment variables.');
    }
    
    console.log('Cloudinary config:', { cloudName, uploadPreset });
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
    
    // Optional: Add folder and transformations
    formData.append('folder', 'portfolio');
    formData.append('tags', 'profile,portfolio');
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Cloudinary upload successful:', data);
    
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

// Delete image from Cloudinary (requires server-side implementation for security)
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    console.log('Cloudinary delete requested for:', imageUrl);
    
    // Note: Client-side deletion is not recommended for security reasons
    // In a production app, you should implement this on your server
    console.warn('Client-side Cloudinary deletion is disabled for security. Implement server-side deletion instead.');
    
    // For now, we'll just log the deletion attempt
    // In a real implementation, you'd call your backend API:
    // const response = await fetch('/api/cloudinary/delete', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ imageUrl })
    // });
    
    return true; // Simulate successful deletion
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error for deletion failures in client-side
    console.warn('Could not delete image from Cloudinary, continuing...');
    return true; // Still return true to allow the flow to continue
  }
};

// Extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }
    
    // Cloudinary URL format examples:
    // https://res.cloudinary.com/cloudname/image/upload/v1234567/folder/filename.jpg
    // https://res.cloudinary.com/cloudname/image/upload/folder/filename.jpg
    
    const urlParts = url.split('/upload/');
    if (urlParts.length < 2) return null;
    
    let publicId = urlParts[1];
    
    // Remove version prefix if present (v1234567/)
    publicId = publicId.replace(/^v\d+\//, '');
    
    // Remove file extension and any transformation parameters
    publicId = publicId.split('.')[0];
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Get optimized image URL with transformations
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url; // Return original URL if not from Cloudinary
  }
  
  const {
    width = 400,
    height = 400,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;
  
  // Extract the base URL and image path
  const baseUrl = url.split('/upload/')[0] + '/upload/';
  const imagePath = url.split('/upload/')[1];
  
  // Build transformations string
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `g_${gravity}`,
    `q_${quality}`,
    `f_${format}`
  ].join(',');
  
  return `${baseUrl}${transformations}/${imagePath}`;
};

// Get responsive image srcSet for different screen sizes
export const getResponsiveSrcSet = (url, sizes = [400, 800, 1200]) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  return sizes.map(size => 
    `${getOptimizedImageUrl(url, { width: size, height: size })} ${size}w`
  ).join(', ');
};

// Utility to check if URL is from Cloudinary
export const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com');
};

// Default export with all utilities
export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  getResponsiveSrcSet,
  isCloudinaryUrl
};