import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseClient } from '@/api/firebaseClient';
import { toast } from 'sonner';
import gsap from 'gsap';
import {
  Shield, Lock, Eye, EyeOff, Save, CheckCircle,
  Key, RefreshCw
} from 'lucide-react';

/**
 * SecurityManager — Manages the OS login password.
 * Stored in Firebase SiteSettings.
 */
export default function SecurityManager() {
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => firebaseClient.entities.SiteSettings.get(),
  });

  const storedPassword = settings?.loginPassword || 'saugat@123';

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => firebaseClient.entities.SiteSettings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Login password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    },
    onError: (err) => {
      toast.error(`Failed to update password: ${err.message}`);
    },
  });

  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        opacity: 0, y: 20,
        stagger: 0.08,
        duration: 0.4,
        ease: 'power3.out',
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (currentPassword !== storedPassword) {
      setError('Current password is incorrect');
      return;
    }

    if (!newPassword.trim()) {
      setError('New password cannot be empty');
      return;
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current');
      return;
    }

    updateMutation.mutate({ loginPassword: newPassword });
  };

  const inputClasses = "w-full pl-10 pr-10 py-2.5 rounded-lg text-sm text-white/90 placeholder-white/30 outline-none transition-all bg-white/5 border border-white/15 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-blue-400" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-xl space-y-6">
      {/* Info card */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-white/90 mb-1">
              OS Login Password
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              This password is used on the SaugatOS login screen. Visitors must enter it to access your portfolio desktop.
              The default password is <code className="px-1.5 py-0.5 rounded bg-white/10 text-blue-300 text-[11px]">saugat@123</code>
            </p>
          </div>
        </div>
      </div>

      {/* Current password display */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/40 uppercase tracking-wider">Current Password</span>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-green-500/10">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-400 font-medium">Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Key className="w-4 h-4 text-white/30" />
          <code className="text-sm text-white/70 font-mono">
            {showCurrent ? storedPassword : '•'.repeat(storedPassword.length)}
          </code>
          <button
            onClick={() => setShowCurrent(!showCurrent)}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
          >
            {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Change password form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Change Password
        </h3>

        {/* Current password */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/50">Current Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setError(''); }}
              placeholder="Enter current password"
              className={inputClasses}
            />
          </div>
        </div>

        {/* New password */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/50">New Password</label>
          <div className="relative">
            <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
              placeholder="Enter new password"
              className={inputClasses}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/50">Confirm New Password</label>
          <div className="relative">
            <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="Re-enter new password"
              className={inputClasses}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <Shield size={14} />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={updateMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          {updateMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
          ) : (
            <>
              <Save size={16} />
              Update Password
            </>
          )}
        </button>
      </form>
    </div>
  );
}
