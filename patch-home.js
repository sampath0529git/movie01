const fs = require('fs');
let code = fs.readFileSync('src/views/HomeView.tsx', 'utf8');

const trendingHeader = `
            <div className="flex flex-col">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
                <TrendingUp className="text-brand-500 w-6 h-6" />
                {t("home.trending_now", "Trending Now")}
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md">
                How trending works: Our algorithm ranks titles based on real-time global viewership and daily popularity scores.
              </p>
            </div>`;

code = code.replace(/<h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">[\s\S]*?<\/h2>/g, trendingHeader);

fs.writeFileSync('src/views/HomeView.tsx', code);
