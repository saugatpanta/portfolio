import React, { useState, useEffect } from 'react'
import { firebaseClient } from '@/api/firebaseClient'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactManager() {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    availability: 'Available for opportunities',
    description: 'Have a project in mind or just want to chat? I\'d love to hear from you!'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    loadContactInfo()
  }, [])

  const loadContactInfo = async () => {
    try {
      const data = await firebaseClient.entities.ContactInfo.get()
      console.log('Loaded contact info:', data)
      if (data) {
        setContactInfo(prev => ({
          ...prev,
          ...data
        }))
        setHasData(true)
      }
    } catch (error) {
      console.error('Error loading contact info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('Saving contact info:', contactInfo)
      
      // Use update which will handle both create and update
      await firebaseClient.entities.ContactInfo.update({
        ...contactInfo,
        updated_at: new Date()
      })
      
      toast.success('Contact information saved successfully!')
      setHasData(true)
    } catch (error) {
      console.error('Error saving contact info:', error)
      toast.error('Failed to save contact information: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setContactInfo({
      email: '',
      phone: '',
      address: '',
      website: '',
      github: '',
      linkedin: '',
      twitter: '',
      availability: 'Available for opportunities',
      description: 'Have a project in mind or just want to chat? I\'d love to hear from you!'
    })
  }

  const handleChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {hasData ? 'Update your contact details' : 'Set up your contact information'}
            </p>
            {!hasData && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                No contact information found. Please fill in the details below and click "Save Changes".
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {hasData ? 'Update Changes' : 'Save Contact Info'}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={contactInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                Address/Location
              </Label>
              <Input
                id="address"
                value={contactInfo.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Your City, Country"
              />
            </div>

            <div>
              <Label htmlFor="website" className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              <Input
                id="website"
                value={contactInfo.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Social Media & Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Media</h3>
            
            <div>
              <Label htmlFor="github" className="flex items-center gap-2 mb-2">
                <Github className="w-4 h-4" />
                GitHub URL
              </Label>
              <Input
                id="github"
                value={contactInfo.github}
                onChange={(e) => handleChange('github', e.target.value)}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-2 mb-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                value={contactInfo.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>

            <div>
              <Label htmlFor="twitter" className="flex items-center gap-2 mb-2">
                <Twitter className="w-4 h-4" />
                Twitter URL
              </Label>
              <Input
                id="twitter"
                value={contactInfo.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourusername"
              />
            </div>

            <div>
              <Label htmlFor="availability" className="mb-2">
                Availability Status
              </Label>
              <Input
                id="availability"
                value={contactInfo.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                placeholder="Available for opportunities"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <Label htmlFor="description" className="mb-2">
            Contact Page Description
          </Label>
          <Textarea
            id="description"
            value={contactInfo.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            placeholder="A welcoming message for your contact page..."
          />
        </div>

        {/* Preview */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="font-semibold mb-4">Live Preview</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {contactInfo.email || 'Not set'}</p>
            <p><strong>Phone:</strong> {contactInfo.phone || 'Not set'}</p>
            <p><strong>Location:</strong> {contactInfo.address || 'Not set'}</p>
            <p><strong>Website:</strong> {contactInfo.website || 'Not set'}</p>
            <p><strong>GitHub:</strong> {contactInfo.github || 'Not set'}</p>
            <p><strong>LinkedIn:</strong> {contactInfo.linkedin || 'Not set'}</p>
            <p><strong>Twitter:</strong> {contactInfo.twitter || 'Not set'}</p>
            <p><strong>Status:</strong> {contactInfo.availability || 'Not set'}</p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Debug Information:</h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p><strong>Document Status:</strong> {hasData ? 'Found in Firebase' : 'Not found - will be created on save'}</p>
            <p><strong>Firebase Project:</strong> {import.meta.env.VITE_FIREBASE_PROJECT_ID}</p>
            <p><strong>Collection:</strong> site_config</p>
            <p><strong>Document ID:</strong> contact_info</p>
          </div>
        </div>
      </Card>
    </div>
  )
}