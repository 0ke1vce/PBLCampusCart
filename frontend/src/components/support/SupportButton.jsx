import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import SupportChat from './SupportChat';

export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-40 flex items-center gap-2"
      >
        <MessageCircle size={24} />
        <span className="font-semibold hidden md:inline">Need Help?</span>
      </button>

      {isOpen && <SupportChat onClose={() => setIsOpen(false)} />}
    </>
  );
}