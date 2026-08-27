const fs = require('fs');
let code = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');

code = code.replace('import { useAuth, saveWatchProgress } from "../firebase";\n"use client";\n', '"use client";\nimport { useAuth, saveWatchProgress } from "../firebase";\n');

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', code);
