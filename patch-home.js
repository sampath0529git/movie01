const fs = require('fs');
let code = fs.readFileSync('src/views/HomeView.tsx', 'utf8');

code = code.replace(
  "import { Search, Star, TrendingUp, ChevronDown } from 'lucide-react';",
  "import { Search, Star, TrendingUp, ChevronDown, Clock } from 'lucide-react';\nimport { useAuth, getContinueWatching } from '../firebase';"
);

code = code.replace(
  '  const [recentSearches, setRecentSearches] = useState<string[]>([]);',
  '  const [recentSearches, setRecentSearches] = useState<string[]>([]);\n  const [continueWatching, setContinueWatching] = useState<any[]>([]);\n  const { user } = useAuth();'
);

code = code.replace(
  '  const navigate = useRouter();',
  '  const navigate = useRouter();\n\n  useEffect(() => {\n    if (user?.uid) {\n      getContinueWatching(user.uid).then(data => setContinueWatching(data)).catch(console.error);\n    }\n  }, [user]);'
);

// Inject Continue Watching UI right above Trending Now
const continueWatchingUI = `
      {continueWatching.length > 0 && (
        <div className="w-full max-w-7xl mx-auto mt-12 mb-2 overflow-hidden">
          <div className="flex items-center mb-4 px-2">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
              <Clock className="text-brand-500 w-6 h-6" />
              Continue Watching
            </h2>
          </div>
          <div className="relative w-full">
            <div className="flex gap-3 md:gap-4 px-2 pb-4 overflow-x-auto custom-scrollbar">
              {continueWatching.map((item, index) => (
                <div 
                  key={\`cw-\${item.id}-\${index}\`} 
                  className="w-[120px] sm:w-[160px] md:w-[200px] lg:w-[220px] shrink-0 cursor-pointer relative group"
                  onClick={() => navigate.push(\`/\${item.mediaType.toLowerCase() === 'movie' ? 'movies' : 'tv'}/\${item.mediaId}\`)}
                >
                  <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#253900] relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                      <div className="h-full bg-brand-500" style={{ width: \`\${Math.min(100, Math.max(0, (item.progress / (item.duration || 1)) * 100))}%\` }}></div>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-sm mt-2 truncate">{item.title}</h3>
                  {item.mediaType === 'TV' && item.seasonNumber !== undefined && item.episodeNumber !== undefined && (
                    <p className="text-xs text-gray-400">S{item.seasonNumber} E{item.episodeNumber}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '      {isLoading ? (',
  continueWatchingUI + '\n      {isLoading ? ('
);

fs.writeFileSync('src/views/HomeView.tsx', code);
