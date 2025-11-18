import React, { useState, useEffect } from 'react'
import { firebaseClient } from '@/api/firebaseClient'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Image as ImageIcon, Save, Trash2, Loader2 } from 'lucide-react'
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
      const data = await firebaseClient.entities.ProfileImage.get();
      if (data && data.profileImage) {
        setProfileImage(data.profileImage);
      } else {
        // Create initial document if it doesn't exist
        await firebaseClient.entities.ProfileImage.create({
          profileImage: '',
          created_at: new Date()
        });
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      // Don't show error for missing document
      if (!error.message.includes('permission') && !error.message.includes('not found')) {
        toast.error('Failed to load profile image');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPEG, PNG, etc.)')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Upload image to Firebase Storage
      const imageUrl = await firebaseClient.storage.uploadImage(file, 'profile')
      
      // Save image URL to Firestore
      await firebaseClient.entities.ProfileImage.update({
        profileImage: imageUrl,
        updated_at: new Date()
      })
      
      setProfileImage(imageUrl)
      toast.success('Profile image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const deleteProfileImage = async () => {
    if (!profileImage) return

    try {
      // Delete from Firestore
      await firebaseClient.entities.ProfileImage.update({
        profileImage: '',
        updated_at: new Date()
      })
      
      // Try to delete from storage (optional)
      try {
        await firebaseClient.storage.deleteImage(profileImage)
      } catch (storageError) {
        console.warn('Could not delete image from storage:', storageError)
      }
      
      setProfileImage('')
      toast.success('Profile image deleted successfully!')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Failed to delete image')
    }
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
                    src={profileImage}
                    alt="Profile Preview"
                    className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-blue-500"
                  />
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
                  Recommended: 400x400px or larger, JPG/PNG format (Max: 5MB)
                </p>
                
                <Input
                  type="file"
                  accept="image/*"
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
                          Uploading...
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
              </div>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Upload a square profile image (recommended: 400x400px or larger)</li>
            <li>• The image will automatically appear on your portfolio homepage</li>
            <li>• You can replace the image anytime by uploading a new one</li>
            <li>• Remove the image to show the default placeholder</li>
            <li>• Supported formats: JPEG, PNG, WebP (Max size: 5MB)</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}