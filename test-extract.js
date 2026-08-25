const str = `<iframe width="600" height="480" src="https://playmogo.com/e/sy41f3skegvr" scrolling="no" frameborder="0" allowfullscreen="true"></iframe>`;
const match = str.match(/<iframe[^>]+src\s*=\s*["']([^"']+)["']/i);
console.log(match ? match[1] : 'no match');
