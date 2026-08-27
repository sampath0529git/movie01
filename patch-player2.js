const fs = require('fs');
let code = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');
code = code.replace(
  'import { useTranslation } from "react-i18next";',
  'import { useTranslation } from "react-i18next";\nimport { useAuth, saveWatchProgress } from "../firebase";'
);

code = code.replace(
  'const { t, i18n } = useTranslation();',
  'const { t, i18n } = useTranslation();\n    const { user } = useAuth();'
);

// We need to inject the logic into the setInterval where it saves to localStorage
code = code.replace(
  'localStorage.setItem(`moviezen_progress_${mediaId}`, currentTimeVal.toString());',
  'localStorage.setItem(`moviezen_progress_${mediaId}`, currentTimeVal.toString());\n            if (user?.uid && item) {\n              saveWatchProgress({\n                userId: user.uid,\n                mediaId,\n                mediaType: item.type,\n                progress: currentTimeVal,\n                duration: durationVal,\n                seasonNumber,\n                episodeNumber,\n                title: item.title,\n                imageUrl: item.imageUrl\n              }).catch(e => console.error("Error saving progress", e));\n            }'
);

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', code);
