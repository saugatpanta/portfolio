import { useState, useEffect } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Image, Upload, Trash2, Loader2 } from 'lucide-react';

export default function WallpapersManager() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const doc = await firebaseClient.entities.SiteSettings.get();
      setWallpapers(doc?.wallpapers || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const url = await firebaseClient.storage.uploadImage(file, 'wallpapers');
      const updated = [...wallpapers, url];
      setWallpapers(updated);
      const doc = await firebaseClient.entities.SiteSettings.get();
      await firebaseClient.entities.SiteSettings.update({ ...doc, wallpapers: updated });
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  const handleDelete = async (idx) => {
    const updated = wallpapers.filter((_, i) => i !== idx);
    setWallpapers(updated);
    try {
      const doc = await firebaseClient.entities.SiteSettings.get();
      await firebaseClient.entities.SiteSettings.update({ ...doc, wallpapers: updated });
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Image className="w-5 h-5 text-purple-400" />
        <div>
          <h2 className="text-lg font-semibold text-white">Desktop Wallpapers</h2>
          <p className="text-xs text-white/40">Upload background images visible to all visitors in Control Panel</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {wallpapers.map((url, i) => (
          <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10 h-24">
            <img src={url} alt={`Wallpaper ${i + 1}`} className="w-full h-full object-cover" />
            <button onClick={() => handleDelete(i)}
              className="absolute top-1 right-1 p-1 rounded bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        <label className="flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer transition-colors">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin text-white/40" /> : <Upload className="w-5 h-5 text-white/40" />}
          <span className="text-xs text-white/40 mt-1">{uploading ? 'Uploading...' : 'Upload'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
        </label>
      </div>

      <p className="text-xs text-white/30">
        Uploaded wallpapers appear in Control Panel → Personalization for all visitors.
      </p>
    </div>
  );
}
