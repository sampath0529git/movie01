const fs = require('fs');
let code = fs.readFileSync('app/not-found.tsx', 'utf8');

if (!code.includes("export const runtime = 'edge';")) {
  code = "export const runtime = 'edge';\n" + code;
  fs.writeFileSync('app/not-found.tsx', code);
}
