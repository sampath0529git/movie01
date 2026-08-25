const str = `<iframe width="600" height="480" src="https://playmogo.com/e/sy41f3skegvr" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>`;
const trimmed = str.trim().replace(/^['"]|['"]$/g, '');
console.log(/<iframe[^>]+src\s*=\s*["']([^"']+)["']/i.test(trimmed));
