import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';
import { Mail, MapPin, Github, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import useOSStore from '@/store/useOSStore';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const { openInBrowser } = useOSStore();

  const { data: contactInfo } = useQuery({ queryKey: ['contact-info'], queryFn: () => firebaseClient.entities.ContactInfo.get(), staleTime: 5 * 60 * 1000 });
  const { data: profileData } = useQuery({ queryKey: ['profile-image'], queryFn: () => firebaseClient.entities.ProfileImage.get(), staleTime: 5 * 60 * 1000 });

  const sendMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.Message.create({ ...data, read: false, replied: false }),
    onSuccess: () => { setSent(true); setForm({ name: '', email: '', subject: '', message: '' }); toast.success('Message sent'); },
    onError: () => toast.error('Failed to send'),
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = true;
    if (!form.subject.trim()) e.subject = true;
    if (!form.message.trim()) e.message = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) sendMutation.mutate(form); };

  const email = contactInfo?.email || 'pantasaugat7@gmail.com';
  const github = contactInfo?.github || 'https://github.com/saugatpanta';
  const linkedin = contactInfo?.linkedin || 'https://linkedin.com/in/saugatpanta';

  return (
    <div className="min-h-full h-full bg-[#0b0f1a] text-gray-100 overflow-y-auto">
      <div className="max-w-[90%] xl:max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 py-16">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-6">Contact</p>
          <h1 className="text-3xl font-light text-white">Let's work together.</h1>
          <p className="text-[15px] text-gray-500 mt-4 max-w-lg">
            Have a project in mind or just want to chat? Drop me a message and I'll get back to you within 24 hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-16">
          {/* Left - Contact info */}
          <motion.div className="md:col-span-2 space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-4">Reach me at</p>
              <a href={`mailto:${email}`} className="text-[14px] text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-600" />{email}
              </a>
              <p className="text-[14px] text-gray-400 flex items-center gap-2 mt-3">
                <MapPin className="w-3.5 h-3.5 text-gray-600" />Kathmandu, Nepal
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-4">Elsewhere</p>
              <div className="space-y-3">
                <button onClick={() => openInBrowser(github)} className="text-[13px] text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Github className="w-3.5 h-3.5" />GitHub
                </button>
                <button onClick={() => openInBrowser(linkedin)} className="text-[13px] text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Linkedin className="w-3.5 h-3.5" />LinkedIn
                </button>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-3">Status</p>
              <span className="inline-flex items-center gap-2 text-[13px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Available for freelance & full-time
              </span>
            </div>

            {/* Map */}
            {contactInfo?.locationLat && contactInfo?.locationLng && contactInfo?.showLocation !== false && (
              <div className="rounded-lg overflow-hidden border border-gray-800 h-36">
                <iframe
                  title="Location"
                  width="100%" height="100%" style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${contactInfo.locationLng - 0.01},${contactInfo.locationLat - 0.007},${contactInfo.locationLng + 0.01},${contactInfo.locationLat + 0.007}&layer=mapnik&marker=${contactInfo.locationLat},${contactInfo.locationLng}`}
                />
              </div>
            )}
          </motion.div>

          {/* Right - Form */}
          <motion.div className="md:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {sent ? (
              <div className="py-16 text-center">
                <p className="text-2xl text-white mb-3">✓</p>
                <p className="text-[15px] text-gray-300 mb-2">Message sent successfully.</p>
                <p className="text-[13px] text-gray-500 mb-6">I'll get back to you soon.</p>
                <button onClick={() => setSent(false)} className="text-[12px] text-gray-400 border border-gray-700 px-4 py-2 rounded-md hover:border-gray-500 hover:text-white transition-colors">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {[
                  { key: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                  { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                  { key: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-gray-600 mb-2">{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={`w-full px-4 py-3 bg-transparent border rounded-md text-[14px] text-white placeholder:text-gray-700 outline-none transition-colors ${errors[f.key] ? 'border-red-800' : 'border-gray-800 focus:border-gray-600'}`}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-gray-600 mb-2">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(v => ({ ...v, message: e.target.value }))}
                    placeholder="Tell me about your project..."
                    rows={5}
                    className={`w-full px-4 py-3 bg-transparent border rounded-md text-[14px] text-white placeholder:text-gray-700 outline-none resize-none transition-colors ${errors.message ? 'border-red-800' : 'border-gray-800 focus:border-gray-600'}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="px-6 py-3 bg-white text-black text-[13px] font-medium rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {sendMutation.isPending ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
