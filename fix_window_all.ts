import fs from 'fs';

function replaceWindowInFile(file: string) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace window.location
    content = content.replace(/window\.location\.href/g, "(typeof window !== 'undefined' ? window.location.href : '')");
    content = content.replace(/window\.location\.origin/g, "(typeof window !== 'undefined' ? window.location.origin : '')");
    
    // Replace window.confirm (though usually in handlers, better safe)
    content = content.replace(/window\.confirm/g, "(typeof window !== 'undefined' ? window.confirm : () => true)");

    // Replace window.scrollY
    content = content.replace(/window\.scrollY/g, "(typeof window !== 'undefined' ? window.scrollY : 0)");
    
    // Replace window.self / window.top
    content = content.replace(/window\.self/g, "(typeof window !== 'undefined' ? window.self : null)");
    content = content.replace(/window\.top/g, "(typeof window !== 'undefined' ? window.top : null)");

    // Ensure all window.open are safe
    content = content.replace(/window\.open\(/g, "typeof window !== 'undefined' && window.open(");

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
}

replaceWindowInFile('src/views/WatchView.tsx');
replaceWindowInFile('src/components/admin/MediaForm.tsx');
replaceWindowInFile('src/components/admin/MediaList.tsx');
replaceWindowInFile('src/components/admin/CollectionList.tsx');
replaceWindowInFile('src/components/LoginModal.tsx');
replaceWindowInFile('src/components/ScrollToTopButton.tsx');
replaceWindowInFile('src/components/Navbar.tsx');
replaceWindowInFile('src/components/ShareModal.tsx');
replaceWindowInFile('src/components/MovieCard.tsx');
replaceWindowInFile('src/components/GlobalMonetization.tsx');
replaceWindowInFile('src/components/MaintenanceView.tsx');

