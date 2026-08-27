const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

if (!code.includes("export const runtime = 'edge';")) {
  code = code.replace(
    "export const dynamic = 'force-dynamic';",
    "export const dynamic = 'force-dynamic';\nexport const runtime = 'edge';"
  );
  fs.writeFileSync('app/layout.tsx', code);
}
