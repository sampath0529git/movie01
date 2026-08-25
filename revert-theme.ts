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
  [/bg-slate-50 dark:bg-\[#000000\]/g, "bg-[#000000]"],
  [/bg-white dark:bg-\[#0a0a0a\]/g, "bg-[#0a0a0a]"],
  [/bg-white dark:bg-\[#0d100c\]/g, "bg-[#0d100c]"],
  [/bg-slate-100 dark:bg-\[#0d1400\]/g, "bg-[#0d1400]"],
  [/bg-white dark:bg-\[#111111\]/g, "bg-[#111111]"],
  [/bg-white dark:bg-\[#111\]/g, "bg-[#111]"],
  [/bg-white dark:bg-\[#161616\]/g, "bg-[#161616]"],
  [/bg-slate-100 dark:bg-\[#1a1a1a\]/g, "bg-[#1a1a1a]"],
  [/bg-white dark:bg-\[#1f1f1f\]/g, "bg-[#1f1f1f]"],
  [/bg-red-50 dark:bg-\[#1f1616\]/g, "bg-[#1f1616]"],
  [/bg-slate-200 dark:bg-\[#253900\]/g, "bg-[#253900]"],
  [/bg-white dark:bg-\[#0a0f00\]/g, "bg-[#0a0f00]"],
  [/bg-white dark:bg-\[#0a0e00\]/g, "bg-[#0a0e00]"],
  
  // Borders
  [/border-slate-200 dark:border-\[#0c1200\]/g, "border-[#0c1200]"],
  [/border-slate-200 dark:border-\[#1a2700\]/g, "border-[#1a2700]"],
  [/border-slate-300 dark:border-\[#253900\]/g, "border-[#253900]"],
  [/border-slate-400 dark:border-\[#385600\]/g, "border-[#385600]"],
  [/border-slate-200 dark:border-\[#222\]/g, "border-[#222]"],
  [/border-black\/5 dark:border-white\/5/g, "border-white/5"],
  
  // Text colors
  [/text-slate-900 dark:text-white/g, "text-white"],
  [/text-slate-700 dark:text-gray-300/g, "text-gray-300"],
  [/text-slate-600 dark:text-gray-400/g, "text-gray-400"],
  [/text-slate-500 dark:text-gray-500/g, "text-gray-500"],
  [/text-slate-900 dark:text-\[#eeeeee\]/g, "text-[#eeeeee]"],
  
  // Hover Backgrounds
  [/hover:bg-slate-200 dark:hover:bg-\[#253900\]/g, "hover:bg-[#253900]"],
  [/hover:bg-slate-100 dark:hover:bg-\[#141d00\]/g, "hover:bg-[#141d00]"],
  [/hover:bg-slate-200 dark:hover:bg-\[#0c1200\]/g, "hover:bg-[#0c1200]"],
  [/hover:bg-slate-100 dark:hover:bg-\[#181818\]/g, "hover:bg-[#181818]"],
  [/hover:bg-slate-100 dark:hover:bg-\[#1a1a1a\]/g, "hover:bg-[#1a1a1a]"],
  [/hover:bg-slate-100 dark:hover:bg-\[#0d1400\]/g, "hover:bg-[#0d1400]"],
  [/hover:bg-slate-100 dark:hover:bg-\[#111111\]/g, "hover:bg-[#111111]"],
  
  // Hover Text
  [/hover:text-black dark:hover:text-white/g, "hover:text-white"],
];

function processFile(filepath: string) {
  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;
  
  for (const [regex, replacement] of replacements) {
     content = content.replace(regex, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filepath, content);
    console.log(`Updated ${filepath}`);
  }
}

walk(path.join(process.cwd(), 'src'), processFile);
