import React, { useState } from "react";
import { motion } from "framer-motion";
import { firebaseClient } from "@/api/firebaseClient";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Send, CheckCircle, Github, Linkedin, Twitter, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get In <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have a project in mind or just want to chat? I'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <Card className="p-8 glass border-0">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold">Email</h3>
                  <p className="text-slate-600 dark:text-slate-400">your.email@example.com</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 glass border-0">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold">Social Media</h3>
                  <p className="text-slate-600 dark:text-slate-400">Let's connect online</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </Card>

            <Card className="p-8 glass border-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <h3 className="font-bold text-lg mb-2">Open to Opportunities</h3>
              <p className="text-slate-600 dark:text-slate-400">
                I'm currently available for freelance work and full-time positions.
                Let's discuss how we can work together!
              </p>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 glass border-0">
              {submitted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Thank you for reaching out. I'll get back to you soon!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      className={`glass transition-all ${
                        hasError('name') 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : touched.name && !errors.name 
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ 
                        opacity: hasError('name') ? 1 : 0,
                        y: hasError('name') ? 0 : -10
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1 mt-2 text-sm text-red-500"
                    >
                      {hasError('name') && (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.name}</span>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
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
                      className={`glass transition-all ${
                        hasError('email') 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : touched.email && !errors.email 
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ 
                        opacity: hasError('email') ? 1 : 0,
                        y: hasError('email') ? 0 : -10
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1 mt-2 text-sm text-red-500"
                    >
                      {hasError('email') && (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.email}</span>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Project inquiry"
                      className={`glass transition-all ${
                        hasError('subject') 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : touched.subject && !errors.subject 
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ 
                        opacity: hasError('subject') ? 1 : 0,
                        y: hasError('subject') ? 0 : -10
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1 mt-2 text-sm text-red-500"
                    >
                      {hasError('subject') && (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.subject}</span>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Tell me about your project..."
                      rows={6}
                      className={`glass resize-none transition-all ${
                        hasError('message') 
                          ? 'border-red-500 focus-visible:ring-red-500' 
                          : touched.message && !errors.message 
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ 
                        opacity: hasError('message') ? 1 : 0,
                        y: hasError('message') ? 0 : -10
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1 mt-2 text-sm text-red-500"
                    >
                      {hasError('message') && (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.message}</span>
                        </>
                      )}
                    </motion.div>
                    {touched.message && !errors.message && formData.message.length >= 10 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-sm text-slate-500"
                      >
                        {formData.message.length} characters
                      </motion.div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={sendMessageMutation.isPending || Object.keys(errors).some(key => errors[key])}
                    className="w-full bg-blue-500 hover:bg-blue-600 gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send className="w-4 h-4" />
                        </motion.div>
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