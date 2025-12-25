import React, { useState, useEffect } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Navigation,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export default function ContactManager() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
    website: "",
    github: "",
    linkedin: "",
    twitter: "",
    description: "",
    availability: "",
    locationLat: "",
    locationLng: "",
    showLocation: true
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [coordinateError, setCoordinateError] = useState("");

  // Fetch current contact info
  const { data: contactInfo, isLoading, refetch } = useQuery({
    queryKey: ['contact-info'],
    queryFn: async () => {
      try {
        const data = await firebaseClient.entities.ContactInfo.get();
        if (data) {
          setFormData({
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            website: data.website || "",
            github: data.github || "",
            linkedin: data.linkedin || "",
            twitter: data.twitter || "",
            description: data.description || "",
            availability: data.availability || "",
            locationLat: data.locationLat || "",
            locationLng: data.locationLng || "",
            showLocation: data.showLocation !== false
          });
        }
        return data || {};
      } catch (error) {
        console.error('Error loading contact info:', error);
        toast.error('Failed to load contact info');
        return {};
      }
    },
    refetchOnWindowFocus: false
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await firebaseClient.entities.ContactInfo.update(data);
    },
    onSuccess: () => {
      toast.success('Contact info saved successfully!');
      setIsEditing(false);
      setCoordinateError("");
      refetch();
    },
    onError: () => {
      toast.error('Failed to save contact info');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear coordinate error when editing
    if (name === "locationLat" || name === "locationLng") {
      setCoordinateError("");
    }
    
    setIsEditing(true);
  };

  const validateCoordinates = () => {
    const lat = parseFloat(formData.locationLat);
    const lng = parseFloat(formData.locationLng);
    
    if (formData.locationLat && formData.locationLng) {
      if (isNaN(lat) || lat < -90 || lat > 90) {
        setCoordinateError("Latitude must be between -90 and 90");
        return false;
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        setCoordinateError("Longitude must be between -180 and 180");
        return false;
      }
    }
    setCoordinateError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate coordinates before submitting
    if (!validateCoordinates()) {
      toast.error("Please fix coordinate errors before saving");
      return;
    }
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      // Convert string coordinates to numbers
      locationLat: formData.locationLat ? parseFloat(formData.locationLat) : null,
      locationLng: formData.locationLng ? parseFloat(formData.locationLng) : null,
      updatedAt: new Date().toISOString()
    };

    updateMutation.mutate(submitData);
  };

  const handleReset = () => {
    if (contactInfo) {
      setFormData({
        email: contactInfo.email || "",
        phone: contactInfo.phone || "",
        address: contactInfo.address || "",
        website: contactInfo.website || "",
        github: contactInfo.github || "",
        linkedin: contactInfo.linkedin || "",
        twitter: contactInfo.twitter || "",
        description: contactInfo.description || "",
        availability: contactInfo.availability || "",
        locationLat: contactInfo.locationLat || "",
        locationLng: contactInfo.locationLng || "",
        showLocation: contactInfo.showLocation !== false
      });
    }
    setIsEditing(false);
    setCoordinateError("");
  };

  // Example coordinates for major cities
  const exampleLocations = [
    { name: "New York, USA", lat: "40.7128", lng: "-74.0060" },
    { name: "London, UK", lat: "51.5074", lng: "-0.1278" },
    { name: "Tokyo, Japan", lat: "35.6762", lng: "139.6503" },
    { name: "Sydney, Australia", lat: "-33.8688", lng: "151.2093" },
    { name: "Dubai, UAE", lat: "25.2048", lng: "55.2708" }
  ];

  const handleUseExample = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      locationLat: lat,
      locationLng: lng
    }));
    setIsEditing(true);
    setCoordinateError("");
    toast.info(`Coordinates set for example location`);
  };

  const openGoogleMaps = () => {
    if (formData.locationLat && formData.locationLng) {
      window.open(`https://www.google.com/maps?q=${formData.locationLat},${formData.locationLng}`, '_blank');
    } else {
      window.open('https://www.google.com/maps', '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500 mx-auto" />
          <p className="text-gray-600">Loading contact info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 contact-manager">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <p className="text-sm text-gray-600">Manage your contact details and location</p>
        </div>
        {isEditing && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Changes
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Details Section */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/username"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Location Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Location Information</h4>
                <p className="text-sm text-gray-600">Set your address and location coordinates</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showLocation"
                  checked={formData.showLocation}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({ ...prev, showLocation: checked }));
                    setIsEditing(true);
                  }}
                />
                <Label htmlFor="showLocation" className="text-sm">Show on map</Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Physical Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, Country"
                rows={2}
                className="w-full"
              />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="availability">Availability Status</Label>
                    <Input
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      placeholder="e.g., Open to Opportunities"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description for contact page"
                      rows={3}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="locationLat">Latitude</Label>
                      <span className="text-xs text-gray-500">Between -90 and 90</span>
                    </div>
                    <Input
                      id="locationLat"
                      name="locationLat"
                      value={formData.locationLat}
                      onChange={handleChange}
                      placeholder="e.g., 37.7749"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="locationLng">Longitude</Label>
                      <span className="text-xs text-gray-500">Between -180 and 180</span>
                    </div>
                    <Input
                      id="locationLng"
                      name="locationLng"
                      value={formData.locationLng}
                      onChange={handleChange}
                      placeholder="e.g., -122.4194"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {coordinateError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{coordinateError}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={openGoogleMaps}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Find Coordinates on Google Maps
                </Button>
                
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        How to find coordinates:
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        1. Go to Google Maps<br />
                        2. Right-click on your location<br />
                        3. Select "What's here?"<br />
                        4. Copy the coordinates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Example Locations */}
            <div className="space-y-2">
              <Label>Example Locations (Click to use):</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {exampleLocations.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleUseExample(loc.lat, loc.lng)}
                    className="text-left p-2 rounded-lg border hover:bg-gray-50 transition-colors text-xs"
                  >
                    <p className="font-medium truncate">{loc.name}</p>
                    <p className="text-gray-500 truncate">
                      {loc.lat}, {loc.lng}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Current Coordinates Preview */}
            {formData.locationLat && formData.locationLng && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Current Coordinates:</p>
                    <p className="text-sm text-green-600">
                      {formData.locationLat}, {formData.locationLng}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${formData.locationLat},${formData.locationLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View on Map
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Save Button - Fixed for mobile visibility */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-gray-200 dark:border-gray-800 save-button-container">
          <Button
            type="submit"
            disabled={updateMutation.isPending || !isEditing || !!coordinateError}
            className="w-full min-h-[44px] gap-2 text-base"
            size="lg"
          >
            {updateMutation.isPending ? (
              <>
                <div className="animate-spin">
                  <RefreshCw className="w-5 h-5" />
                </div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Contact Information
              </>
            )}
          </Button>
          {!isEditing && (
            <p className="text-center text-sm text-gray-500 mt-2">
              No changes to save
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
