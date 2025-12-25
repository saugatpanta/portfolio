import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { firebaseClient } from "@/api/firebaseClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Send, CheckCircle, Github, Linkedin, Twitter, AlertCircle, Phone, MapPin, Globe, Navigation } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const VALIDATION_RULES = {
  name: { minLength: 2, required: true },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  subject: { minLength: 3, required: true },
  message: { minLength: 10, required: true }
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now()); // Key to force re-render when location changes

  // Default location (San Francisco)
  const defaultLocation = {
    lat: 37.7749,
    lng: -122.4194
  };

  // Fetch contact info from Firebase
  const { data: contactInfo, isLoading } = useQuery({
    queryKey: ['contact-info'],
    queryFn: async () => {
      try {
        const data = await firebaseClient.entities.ContactInfo.get();
        console.log('Contact info loaded:', data);
        return data || {};
      } catch (error) {
        console.error('Error loading contact info:', error);
        return {};
      }
    },
    refetchOnWindowFocus: false
  });

  // Extract location from contact info or use default
  const location = contactInfo?.locationLat && contactInfo?.locationLng 
    ? { lat: contactInfo.locationLat, lng: contactInfo.locationLng }
    : defaultLocation;

  // Update map when location changes
  useEffect(() => {
    setMapKey(Date.now());
  }, [contactInfo?.locationLat, contactInfo?.locationLng]);

  const sendMessageMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.Message.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
      setTouched({});
      toast.success("Message sent successfully!");
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    }
  });

  const validateField = (name, value) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return null;

    if (rules.required && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (rules.minLength && value.trim().length < rules.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rules.minLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(VALIDATION_RULES).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation after field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(VALIDATION_RULES).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const newErrors = validateForm();
    setErrors(newErrors);

    // Check if there are any errors
    if (Object.keys(newErrors).length === 0) {
      sendMessageMutation.mutate(formData);
    } else {
      toast.error("Please fix the errors before submitting");
    }
  };

  const hasError = (field) => touched[field] && errors[field];

  // Create custom marker icon
  const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="min-h-screen py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
            Get In <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2 sm:px-4">
            {contactInfo?.description || "Have a project in mind or just want to chat? I'd love to hear from you!"}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Basic Contact Card */}
            <Card className="p-4 sm:p-6 md:p-8 glass border-0">
              <div className="space-y-4 sm:space-y-6">
                {/* Email */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg">Email</h3>
                    {contactInfo?.email ? (
                      <a 
                        href={`mailto:${contactInfo.email}`}
                        className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors truncate block"
                      >
                        {contactInfo.email}
                      </a>
                    ) : (
                      <p className="text-xs sm:text-sm md:text-base text-slate-400 dark:text-slate-600 italic">
                        Email not configured
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg">Phone</h3>
                    {contactInfo?.phone ? (
                      <a 
                        href={`tel:${contactInfo.phone}`}
                        className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-green-500 transition-colors truncate block"
                      >
                        {contactInfo.phone}
                      </a>
                    ) : (
                      <p className="text-xs sm:text-sm md:text-base text-slate-400 dark:text-slate-600 italic">
                        Phone not configured
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg">Location</h3>
                    {contactInfo?.address ? (
                      <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                        {contactInfo.address}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm md:text-base text-slate-400 dark:text-slate-600 italic">
                        Location not configured
                      </p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg">Website</h3>
                    {contactInfo?.website ? (
                      <a 
                        href={contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors truncate block"
                      >
                        {contactInfo.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <p className="text-xs sm:text-sm md:text-base text-slate-400 dark:text-slate-600 italic">
                        Website not configured
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Map Card */}
            <Card className="p-0 overflow-hidden glass border-0 h-64 sm:h-72 md:h-80 lg:h-96">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  {isLoading ? (
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm">Loading map...</p>
                    </div>
                  ) : (
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-4">
                      <Navigation className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">{contactInfo?.address || "Location not set"}</p>
                    </div>
                  )}
                </div>
                <MapContainer
                  key={mapKey}
                  center={[location.lat, location.lng]}
                  zoom={contactInfo?.address ? 13 : 2}
                  className="h-full w-full z-0"
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {contactInfo?.address && (
                    <Marker position={[location.lat, location.lng]} icon={customIcon}>
                      <Popup>
                        <div className="text-sm">
                          <strong>My Location</strong>
                          <p className="mt-1">{contactInfo.address}</p>
                          {contactInfo?.email && (
                            <a 
                              href={`mailto:${contactInfo.email}`}
                              className="text-blue-500 hover:underline block mt-1"
                            >
                              {contactInfo.email}
                            </a>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
                <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs">
                  <a 
                    href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </Card>

            {/* Social Media Card */}
            <Card className="p-4 sm:p-6 md:p-8 glass border-0">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg">Social Media</h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                    Let's connect online
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 sm:gap-4">
                {contactInfo?.github && (
                  <a
                    href={contactInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-700 hover:text-white transition-all flex-shrink-0"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                {contactInfo?.linkedin && (
                  <a
                    href={contactInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all flex-shrink-0"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                {contactInfo?.twitter && (
                  <a
                    href={contactInfo.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all flex-shrink-0"
                    title="Twitter"
                  >
                    <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
              </div>

              {!contactInfo?.github && !contactInfo?.linkedin && !contactInfo?.twitter && (
                <p className="text-xs text-slate-500 mt-3 sm:mt-4 text-center">
                  Configure social links in the admin panel
                </p>
              )}
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 sm:p-6 md:p-8 glass border-0 h-full">
              {submitted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6 sm:py-8 md:py-12"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400">
                    Thank you for reaching out. I'll get back to you soon!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6" noValidate>
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      className={`glass transition-all text-sm sm:text-base ${
                        hasError('name') 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : touched.name && !errors.name 
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    {hasError('name') && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm text-red-500"
                      >
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{errors.name}</span>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="john@example.com"
                      className={`glass transition-all text-sm sm:text-base ${
                        hasError('email') 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : touched.email && !errors.email 
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    {hasError('email') && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm text-red-500"
                      >
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{errors.email}</span>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Project inquiry"
                      className={`glass transition-all text-sm sm:text-base ${
                        hasError('subject') 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : touched.subject && !errors.subject 
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    {hasError('subject') && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm text-red-500"
                      >
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{errors.subject}</span>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Tell me about your project..."
                      rows={4}
                      className={`glass resize-none transition-all text-sm sm:text-base ${
                        hasError('message') 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : touched.message && !errors.message 
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    {hasError('message') && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm text-red-500"
                      >
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{errors.message}</span>
                      </motion.div>
                    )}
                    {touched.message && !errors.message && formData.message.length >= 10 && (
                      <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">
                        {formData.message.length} characters
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={sendMessageMutation.isPending || Object.keys(errors).some(key => errors[key])}
                    className="w-full bg-blue-500 hover:bg-blue-600 gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    size="lg"
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <div className="animate-spin">
                          <Send className="w-4 h-4" />
                        </div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
