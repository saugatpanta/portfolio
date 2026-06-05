import { Trash2 } from 'lucide-react';
export default function RecycleBin() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#f1f5f9] text-gray-900 gap-4">
      <Trash2 className="h-16 w-16 text-gray-300" />
      <div className="text-center">
        <p className="text-gray-500 font-medium">Recycle Bin is empty</p>
        <p className="text-gray-400 text-sm mt-1">Deleted items will appear here</p>
      </div>
    </div>
  );
}
