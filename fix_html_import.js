const fs = require('fs');
const files = fs.readdirSync('src/components', { recursive: true });

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const filePath = 'src/components/' + file;
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('import { Html } from "next/document"')) {
      console.log('Found next/document import in: ' + filePath);
    }
  }
});
