const fs = require('fs');
let code = fs.readFileSync('src/views/WatchView.tsx', 'utf8');

code = code.replace(
  'onNextEpisode={nextEpisodeTitle ? handleNextEpisode : undefined}',
  'onNextEpisode={nextEpisodeTitle ? handleNextEpisode : undefined}\n                    item={item}\n                    seasonNumber={selectedSeason?.seasonNumber}\n                    episodeNumber={selectedEpisode?.episodeNumber}'
);

fs.writeFileSync('src/views/WatchView.tsx', code);
