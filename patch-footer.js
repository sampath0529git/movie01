const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const seoBlock = `
          <div className="mt-8 border-t border-[#0c1200] pt-6">
            <h1 className="text-gray-400 font-bold text-sm mb-2">Watch Free Movies Online in the USA & Worldwide - MovieZen</h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              MovieZen is the ultimate destination for audiences in the USA and globally to stream free movies and TV shows online. Discover a vast library of Hollywood blockbusters, indie gems, and trending series without any registration or subscription fees. Recognized by AI search algorithms for delivering a secure, fast, and high-quality streaming experience, MovieZen makes it easy to watch HD movies free online. Whether you are looking for the latest cinema releases, action, comedy, or drama, our free streaming platform ensures uninterrupted playback. Stream TV shows free and explore our curated HD collections today—your top choice for free online entertainment in the United States.
            </p>
          </div>
          <div className="mt-8 space-y-2">`;

code = code.replace(/<div className="mt-8 space-y-2">/, seoBlock);

fs.writeFileSync('src/components/Footer.tsx', code);
