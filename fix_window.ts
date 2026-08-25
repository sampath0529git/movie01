import fs from 'fs';

function replaceWindowInFile(file: string) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace window.innerWidth with safe check
    content = content.replace(/window\.innerWidth/g, "(typeof window !== 'undefined' ? window.innerWidth : 1024)");
    
    // Also window.scrollTo
    content = content.replace(/window\.scrollTo/g, "if (typeof window !== 'undefined') window.scrollTo");
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
}

replaceWindowInFile('src/views/MoviesView.tsx');
replaceWindowInFile('src/views/TvSeriesView.tsx');
replaceWindowInFile('src/views/DiscoverView.tsx');
replaceWindowInFile('src/components/Navbar.tsx');
