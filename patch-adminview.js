const fs = require('fs');
let code = fs.readFileSync('src/views/AdminView.tsx', 'utf8');

code = code.replace(
  "import { useMediaData, auth } from '../firebase';",
  "import { useMediaData, auth, useAuth } from '../firebase';"
);

// We need to inject the auth logic at the top of AdminView
const authHookCode = `
  const { user, loading: authLoading, isAdmin, handleGoogleSignIn, isGoogleLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050800]">
        <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050800] p-4 text-center">
        <div className="max-w-md w-full bg-[#0a0f00] border border-[#1a2700] rounded-2xl p-8 flex flex-col items-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            You need administrator privileges to access this area. Please sign in with an authorized account.
          </p>
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors disabled:opacity-70"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }
`;

code = code.replace(
  "  const [addingType, setAddingType] = useState<'MOVIE' | 'TV'>('MOVIE');",
  "  const [addingType, setAddingType] = useState<'MOVIE' | 'TV'>('MOVIE');\n" + authHookCode
);

fs.writeFileSync('src/views/AdminView.tsx', code);
