import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Add EMPTY_MEDIA at top of file
if 'const EMPTY_MEDIA' not in content:
    content = content.replace('export default function Navbar({', 'const EMPTY_MEDIA: MediaItem[] = [];\n\nexport default function Navbar({')

content = content.replace('customMedia = [] as MediaItem[],', 'customMedia = EMPTY_MEDIA,')
content = content.replace('customMedia = [],', 'customMedia = EMPTY_MEDIA,')

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
print('Fixed Navbar array')
