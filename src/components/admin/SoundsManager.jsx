import { useState, useEffect } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Volume2, Upload, Trash2, Play, Loader2 } from 'lucide-react';

const SOUND_KEYS = [
  { key: 'boot', label: 'Boot Sound', desc: 'Plays during boot animation' },
  { key: 'login', label: 'Login Sound', desc: 'Plays when entering desktop' },
  { key: 'open', label: 'Window Open', desc: 'Plays when a window opens' },
  { key: 'close', label: 'Window Close', desc: 'Plays when a window closes' },
  { key: 'minimize', label: 'Minimize', desc: 'Plays on window minimize' },
  { key: 'notification', label: 'Notification', desc: 'Plays on new notification' },
  { key: 'error', label: 'Error', desc: 'Plays on error events' },
  { key: 'startup', label: 'Startup Chime', desc: 'Plays after boot completes' },
];

export default function SoundsManager() {
  const [sounds, setSounds] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    loadSounds();
  }, []);

  const loadSounds = async () => {
    try {
      const doc = await firebaseClient.entities.SiteSettings.get();
      setSounds(doc?.sounds || {});
    } catch (e) {
      console.error('Failed to load sounds:', e);
    }
    setLoading(false);
  };

  const handleUpload = async (key, file) => {
    if (!file || !file.type.startsWith('audio/')) return;
    setUploading(key);
    try {
      const url = await firebaseClient.storage.uploadImage(file, `sounds/${key}`);
      const updated = { ...sounds, [key]: url };
      setSounds(updated);
      // Save to Firebase site_config
      const docRef = await firebaseClient.entities.SiteSettings.get();
      await firebaseClient.entities.SiteSettings.update({ ...docRef, sounds: updated });
    } catch (e) {
      console.error('Upload failed:', e);
    }
    setUploading(null);
  };

  const handleDelete = async (key) => {
    const updated = { ...sounds };
    delete updated[key];
    setSounds(updated);
    try {
      const docRef = await firebaseClient.entities.SiteSettings.get();
      await firebaseClient.entities.SiteSettings.update({ ...docRef, sounds: updated });
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handlePlay = (key) => {
    const url = sounds[key];
    if (!url) return;
    setPlaying(key);
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play();
    audio.onended = () => setPlaying(null);
    setTimeout(() => setPlaying(null), 5000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Volume2 className="w-5 h-5 text-blue-400" />
        <div>
          <h2 className="text-lg font-semibold text-white">OS Sounds</h2>
          <p className="text-xs text-white/40">Upload audio files for Windows 7 sound effects</p>
        </div>
      </div>

      <div className="space-y-3">
        {SOUND_KEYS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90">{label}</p>
              <p className="text-xs text-white/40">{desc}</p>
            </div>

            {sounds[key] ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-400">✓ Set</span>
                <button onClick={() => handlePlay(key)} disabled={playing === key}
                  className="p-1.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors">
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(key)}
                  className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 cursor-pointer transition-colors">
                {uploading === key ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white/60" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-white/60" />
                )}
                <span className="text-xs text-white/60">Upload</span>
                <input type="file" accept="audio/*" className="hidden"
                  onChange={(e) => handleUpload(key, e.target.files?.[0])} />
              </label>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-white/30">
        Tip: Use short .mp3 files (under 500KB) for best performance. Sounds are stored via Cloudinary.
      </p>
    </div>
  );
}
