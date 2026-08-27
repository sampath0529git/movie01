const fs = require('fs');
let code = fs.readFileSync('src/views/AdminView.tsx', 'utf8');

// Remove useMediaData from its current position
code = code.replace(
  '  const { data: media, loading, loadMore, hasMore } = useMediaData();\n',
  ''
);

// Inject it before the early returns
code = code.replace(
  '  const { user, loading: authLoading, isAdmin, handleGoogleSignIn, isGoogleLoading, logout } = useAuth();\n',
  '  const { user, loading: authLoading, isAdmin, handleGoogleSignIn, isGoogleLoading, logout } = useAuth();\n  const { data: media, loading, loadMore, hasMore } = useMediaData();\n'
);

fs.writeFileSync('src/views/AdminView.tsx', code);
