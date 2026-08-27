const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

// We need to inject the real auth logic.
const realAuthHook = `
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

const ADMIN_EMAILS = ['admin@moviezen.com', 'moviesclip808@gmail.com'];

export const auth = getAuth(app);

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  return { user, loading, isAdmin, login: handleGoogleSignIn, logout, isGoogleLoading, handleGoogleSignIn };
}
`;

// Remove the old mocked useAuth function and the export const auth stub
// The old useAuth starts with: `export function useAuth() {` and ends before `import { initializeApp }`
// The stub auth starts at the very end `export const auth = { signOut: async () => {} } as any;`

code = code.replace(/export function useAuth\(\) \{[\s\S]*?handleGoogleSignIn: \(\) => \{\} \};\n\}/, '');
code = code.replace(/export const auth = \{ signOut: async \(\) => \{\} \} as any;/g, '');
code = code.replace("import { getAuth } from 'firebase/auth';", "");

code += realAuthHook;

fs.writeFileSync('src/firebase.ts', code);
