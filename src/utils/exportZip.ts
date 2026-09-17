import JSZip from 'jszip';

// Load source and config files as raw strings via Vite's import.meta.glob
const srcFiles = import.meta.glob(
  ['/src/**/*', '/public/**/*', '/index.html', '/package.json', '/metadata.json', '/vite.config.ts', '/tsconfig.json'],
  { query: '?raw', import: 'default', eager: true }
);

export async function downloadAppZip(): Promise<void> {
  const zip = new JSZip();

  // Add all application files to the zip
  for (const [filepath, content] of Object.entries(srcFiles)) {
    // Clean up leading slash e.g. /src/App.tsx -> src/App.tsx
    const cleanPath = filepath.replace(/^\//, '');
    if (typeof content === 'string') {
      zip.file(cleanPath, content);
    }
  }

  // Add a handy README.md
  zip.file(
    'README.md',
    `# Animal Math Quest: Kids Addition Adventure

An interactive, colorful animal math guessing and addition game for kids featuring tactile counting, audio rewards, virtual stickers and badges, multi-profile progress tracking, and offline support.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start local development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Build production bundle:
   \`\`\`bash
   npm run build
   \`\`\`
`
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'animal-math-quest.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
