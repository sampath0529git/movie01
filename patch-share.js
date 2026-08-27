const fs = require('fs');
let code = fs.readFileSync('src/components/ShareModal.tsx', 'utf8');

const telegramButton = `
          <button onClick={() => openPopup(shareLinks.telegram)} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
            </div>
            <span className="text-xs text-gray-400">Telegram</span>
          </button>
`;

// Replace `grid-cols-4` with `grid-cols-5` or `grid-cols-4` with flex wrapping
code = code.replace('grid grid-cols-4 gap-4 mb-6', 'grid grid-cols-5 gap-4 mb-6');

// Insert the telegram button right before the More button
code = code.replace(
  '<button onClick={handleNativeShare}',
  telegramButton + '          <button onClick={handleNativeShare}'
);

fs.writeFileSync('src/components/ShareModal.tsx', code);
