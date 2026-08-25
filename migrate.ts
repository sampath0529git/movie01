import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Vite env replacements
    content = content.replace(/import\.meta\.env\.VITE_/g, 'process.env.NEXT_PUBLIC_');
    content = content.replace(/import\.meta\.env\.DEV/g, '(process.env.NODE_ENV !== "production")');

    // React Router DOM replacements
    if (content.includes('react-router-dom')) {
        let hasLink = content.includes('Link');
        let hasNavigate = content.includes('useNavigate');
        let hasLocation = content.includes('useLocation');
        let hasParams = content.includes('useParams');

        // Remove react-router-dom import completely
        content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]react-router-dom['"];?\n?/g, '');

        let newImports = '';
        if (hasLink) newImports += `import Link from 'next/link';\n`;
        
        let navImports = [];
        if (hasNavigate) navImports.push('useRouter');
        if (hasLocation) navImports.push('usePathname', 'useSearchParams');
        if (hasParams) navImports.push('useParams');
        
        if (navImports.length > 0) {
            newImports += `import { ${navImports.join(', ')} } from 'next/navigation';\n`;
        }

        // Add back standard imports
        content = newImports + content;

        // Replace hooks
        content = content.replace(/const\s+(\w+)\s*=\s*useNavigate\(\);/g, 'const $1 = useRouter();');
        content = content.replace(/useNavigate\(\)/g, 'useRouter()');
        content = content.replace(/const\s+(\w+)\s*=\s*useLocation\(\);/g, 'const pathname = usePathname(); const searchParams = useSearchParams();\n  const $1 = { pathname, search: searchParams ? searchParams.toString() : "" };');
        
        // Link component attributes - replace `to=` with `href=`
        content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
    }

    // Next.js uses NextImage for optimization, but standard <img> is fine for migration.
    
    // Add "use client" if it has React hooks and is not a layout or server component
    if ((content.includes('useState') || content.includes('useEffect') || content.includes('useRouter') || content.includes('usePathname') || content.includes('useRef')) && !content.includes('"use client"')) {
        content = '"use client";\n' + content;
    }

    // Fix react-router-dom Link being missing if imported from elsewhere
    // Not needed usually

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory('./src');
