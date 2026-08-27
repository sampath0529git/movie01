const fs = require('fs');
let code = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');
code = code.replace(
  '  nextEpisodeTitle?: string;\n  onNextEpisode?: () => void;\n}',
  '  nextEpisodeTitle?: string;\n  onNextEpisode?: () => void;\n  item?: any;\n  seasonNumber?: number;\n  episodeNumber?: number;\n}'
);
code = code.replace(
  '      playerMode = "auto",\n      nextEpisodeTitle,\n      onNextEpisode\n    },',
  '      playerMode = "auto",\n      nextEpisodeTitle,\n      onNextEpisode,\n      item,\n      seasonNumber,\n      episodeNumber\n    },'
);
fs.writeFileSync('src/components/CustomVideoPlayer.tsx', code);
