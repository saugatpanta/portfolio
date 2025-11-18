import React, { useState, useEffect } from 'react'
import { firebaseClient } from '@/api/firebaseClient'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Image as ImageIcon, Save, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfileManager() {
  const [profileImage, setProfileImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfileImage()
  }, [])

  const loadProfileImage = async () => {
    try {
      console.log('Loading profile image...')
      const data = await firebaseClient.entities.ProfileImage.get();
      console.log('Profile image data:', data)
      
      if (data && data.profileImage) {
        setProfileImage(data.profileImage);
        console.log('Profile image set:', data.profileImage)
      } else {
        console.log('No profile image found, creating initial document...')
        // Create initial document if it doesn't exist
        await firebaseClient.entities.ProfileImage.create({
          profileImage: '',
          created_at: new Date()
        });
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      toast.error('Failed to load profile image');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    console.log('File selected:', file.name, file.size, file.type)

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP, GIF)')
      return
    }

    // Validate file size (10MB max - Cloudinary can handle larger)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB')
      return
    }

    setUploading(true)

    try {
      console.log('Starting Cloudinary upload process...')
      
      // Upload image to Cloudinary
      const imageUrl = await firebaseClient.storage.uploadImage(file, 'profile')
      console.log('Image uploaded to Cloudinary:', imageUrl)
      
      // Save image URL to Firestore
      await firebaseClient.entities.ProfileImage.update({
        profileImage: imageUrl,
        updated_at: new Date()
      })
      console.log('Profile image saved to Firestore')
      
      setProfileImage(imageUrl)
      toast.success('Profile image uploaded successfully!')
      
    } catch (error) {
      console.error('Error in upload process:', error)
      toast.error(`Failed to upload image: ${error.message}`)
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const deleteProfileImage = async () => {
    if (!profileImage) return

    try {
      console.log('Deleting profile image...')
      
      // Delete from Cloudinary
      if (profileImage.includes('cloudinary.com')) {
        await firebaseClient.storage.deleteImage(profileImage)
        console.log('Image deleted from Cloudinary')
      }
      
      // Delete from Firestore
      await firebaseClient.entities.ProfileImage.update({
        profileImage: '',
        updated_at: new Date()
      })
      console.log('Profile image removed from Firestore')
      
      setProfileImage('')
      toast.success('Profile image deleted successfully!')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Failed to delete image')
    }
  }

  const getOptimizedPreviewUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    // Get optimized version for preview (200x200, auto crop, good quality)
    return url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto,f_auto/');
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Profile Image Management</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Current Image Preview */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Current Profile Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {profileImage ? (
                <div className="space-y-4">
                  <img
                    src={getOptimizedPreviewUrl(profileImage)}
                    alt="Profile Preview"
                    className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-blue-500"
                    onError={(e) => {
                      console.error('Image failed to load:', profileImage)
                      e.target.style.display = 'none'
                      toast.error('Failed to load profile image')
                    }}
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 break-all text-center">
                      {profileImage.includes('cloudinary.com') ? '✓ Stored in Cloudinary' : 'Storage: Unknown'}
                    </p>
                    <a 
                      href={profileImage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Original
                    </a>
                  </div>
                  <Button
                    onClick={deleteProfileImage}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>No profile image set</p>
                  <p className="text-sm mt-2">Upload an image to display on your portfolio</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Upload New Image</Label>
            <Card className="p-6 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">
                  Upload a square image for best results
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Recommended: 400x400px or larger<br />
                  Formats: JPG, PNG, WebP, GIF (Max: 10MB)
                </p>
                
                <Input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png, image/webp, image/gif"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="profile-image-upload"
                />
                <Label htmlFor="profile-image-upload">
                  <Button
                    asChild
                    variant="outline"
                    disabled={uploading}
                    className="gap-2 cursor-pointer"
                  >
                    <span>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading to Cloudinary...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Choose Image
                        </>
                      )}
                    </span>
                  </Button>
                </Label>
                
                {uploading && (
                  <div className="mt-4 text-sm text-blue-600">
                    Uploading to Cloudinary... Please wait.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Cloudinary Features */}
        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            ✓ Cloudinary Features Enabled
          </h3>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>• Automatic image optimization and compression</li>
            <li>• Multiple format support (WebP, AVIF auto-conversion)</li>
            <li>• Responsive image delivery</li>
            <li>• Automatic cropping and resizing</li>
            <li>• Faster CDN delivery worldwide</li>
            <li>• Better image quality with smaller file sizes</li>
          </ul>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Storage: {profileImage.includes('cloudinary.com') ? 'Cloudinary' : 'Unknown'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Uploading: {uploading ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
            URL: {profileImage || 'None'}
          </p>
        </div>
      </Card>
    </div>
  )
}