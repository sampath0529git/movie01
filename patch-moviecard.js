const fs = require('fs');
let code = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');

const titleBlock = `
      <div>
        <h3 className="text-[15px] font-bold text-white truncate group-hover:text-brand-500 transition-colors">
          {item.title}
        </h3>
        <div className="flex justify-between items-center text-[13px] text-gray-400 mt-1">
          <span>{item.year}</span>
          {item.duration && <span>{item.duration}</span>}
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 group-hover:text-gray-400 transition-colors" title={item.description}>
            {item.description}
          </p>
        )}
      </div>`;

code = code.replace(/<div>\s*<h3 className="text-\[15px\] font-bold text-white truncate group-hover:text-brand-500 transition-colors">[\s\S]*?<\/div>\s*<\/div>/, titleBlock + '\n    </div>');

fs.writeFileSync('src/components/MovieCard.tsx', code);
