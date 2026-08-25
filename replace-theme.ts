import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, callback);
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
      callback(filepath);
    }
  }
}

const replacements: [RegExp, string][] = [
  // Backgrounds
  [/\bbg-\[#000000\]/g, "bg-slate-50 dark:bg-[#000000]"],
  [/\bbg-\[#0a0a0a\]/g, "bg-white dark:bg-[#0a0a0a]"],
  [/\bbg-\[#0d100c\]/g, "bg-white dark:bg-[#0d100c]"],
  [/\bbg-\[#0d1400\]/g, "bg-slate-100 dark:bg-[#0d1400]"],
  [/\bbg-\[#111111\]/g, "bg-white dark:bg-[#111111]"],
  [/\bbg-\[#111\]/g, "bg-white dark:bg-[#111]"],
  [/\bbg-\[#161616\]/g, "bg-white dark:bg-[#161616]"],
  [/\bbg-\[#1a1a1a\]/g, "bg-slate-100 dark:bg-[#1a1a1a]"],
  [/\bbg-\[#1f1f1f\]/g, "bg-white dark:bg-[#1f1f1f]"],
  [/\bbg-\[#1f1616\]/g, "bg-red-50 dark:bg-[#1f1616]"],
  [/\bbg-\[#253900\]/g, "bg-slate-200 dark:bg-[#253900]"],
  [/\bbg-\[#0a0f00\]/g, "bg-white dark:bg-[#0a0f00]"],
  [/\bbg-\[#0a0e00\]/g, "bg-white dark:bg-[#0a0e00]"],
  
  // Borders
  [/\bborder-\[#0c1200\]/g, "border-slate-200 dark:border-[#0c1200]"],
  [/\bborder-\[#1a2700\]/g, "border-slate-200 dark:border-[#1a2700]"],
  [/\bborder-\[#253900\]/g, "border-slate-300 dark:border-[#253900]"],
  [/\bborder-\[#385600\]/g, "border-slate-400 dark:border-[#385600]"],
  [/\bborder-\[#222\]/g, "border-slate-200 dark:border-[#222]"],
  [/\border-white\/5\b/g, "border-black/5 dark:border-white/5"],
  
  // Text colors
  [/\btext-white\b/g, "text-slate-900 dark:text-white"],
  [/\btext-gray-300\b/g, "text-slate-700 dark:text-gray-300"],
  [/\btext-gray-400\b/g, "text-slate-600 dark:text-gray-400"],
  [/\btext-gray-500\b/g, "text-slate-500 dark:text-gray-500"],
  [/\btext-\[#eeeeee\]\b/g, "text-slate-900 dark:text-[#eeeeee]"],
  
  // Hover Backgrounds
  [/\bhover:bg-\[#253900\]/g, "hover:bg-slate-200 dark:hover:bg-[#253900]"],
  [/\bhover:bg-\[#141d00\]/g, "hover:bg-slate-100 dark:hover:bg-[#141d00]"],
  [/\bhover:bg-\[#0c1200\]/g, "hover:bg-slate-200 dark:hover:bg-[#0c1200]"],
  [/\bhover:bg-\[#181818\]/g, "hover:bg-slate-100 dark:hover:bg-[#181818]"],
  [/\bhover:bg-\[#1a1a1a\]/g, "hover:bg-slate-100 dark:hover:bg-[#1a1a1a]"],
  [/\bhover:bg-\[#0d1400\]/g, "hover:bg-slate-100 dark:hover:bg-[#0d1400]"],
  [/\bhover:bg-\[#111111\]/g, "hover:bg-slate-100 dark:hover:bg-[#111111]"],
  
  // Hover Text
  [/\bhover:text-white\b/g, "hover:text-black dark:hover:text-white"],
];

function processFile(filepath: string) {
  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;
  
  // To avoid recursive replacement like text-slate-900 dark:text-slate-900 dark:text-white
  // we first clean existing replacements. Let's just assume this is a fresh run.
  
  // Avoid replacing if it's already got dark: (very basic heuristic)
  // Actually, replace will just match any word boundary.
  
  // Apply replacements safely
  for (const [regex, replacement] of replacements) {
     content = content.replace(regex, (match, offset, string) => {
        // If the match is prefixed by `dark:` or `-`, ignore
        if (offset > 5 && string.substring(offset - 5, offset) === 'dark:') {
          return match; 
        }
        return replacement;
     });
  }

  // Sometimes there might be a trailing dark: if it was already updated previously
  // We'll trust this runs nicely if it's the first time
  if (content !== originalContent) {
    fs.writeFileSync(filepath, content);
    console.log(`Updated ${filepath}`);
  }
}

walk(path.join(process.cwd(), 'src'), processFile);
