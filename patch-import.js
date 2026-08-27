const fs = require('fs');
let code = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');

if (!code.includes('saveWatchProgress')) {
  console.log("NOT FOUND");
}

code = 'import { useAuth, saveWatchProgress } from "../firebase";\n' + code;

// Also replace `const { user } = useAuth();` inside the component body if missing.
if (!code.includes('const { user } = useAuth();')) {
  code = code.replace(
    '    const [volume, setVolume] = useState(() => {',
    '    const { user } = useAuth();\n    const [volume, setVolume] = useState(() => {'
  );
}

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', code);
