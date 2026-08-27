const fs = require('fs');
let code = fs.readFileSync('src/views/AdminView.tsx', 'utf8');

// Inject logout into the destructured useAuth call
code = code.replace(
  'const { user, loading: authLoading, isAdmin, handleGoogleSignIn, isGoogleLoading } = useAuth();',
  'const { user, loading: authLoading, isAdmin, handleGoogleSignIn, isGoogleLoading, logout } = useAuth();'
);

// Add the logout button at the end of the sidebar
code = code.replace(
  '        </nav>\n      </aside>',
  '        </nav>\n        <div className="mt-8">\n          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold w-full text-red-500 hover:bg-red-500/10 transition-colors">\n            <LogOut className="w-5 h-5" />\n            Sign Out\n          </button>\n        </div>\n      </aside>'
);

fs.writeFileSync('src/views/AdminView.tsx', code);
