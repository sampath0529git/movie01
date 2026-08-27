const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

code = code.replace(
  /<a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t\("footer\.contact", "Contact"\)}<\/a>/,
  '<a href="mailto:contact@moviezen.me" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.contact", "Contact")}</a>'
);

if (!code.includes('href="/about"')) {
    code = code.replace(
      /<ul className="space-y-3">/,
      '<ul className="space-y-3">\n              <li>\n                <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link>\n              </li>'
    );
    fs.writeFileSync('src/components/Footer.tsx', code);
}

