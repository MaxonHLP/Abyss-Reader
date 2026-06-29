const fs = require('fs');
const code = fs.readFileSync('Work.tsx', 'utf-8');
const lines = code.split(/\r?\n/);

const replacement = `    // Actualizar UI al instante (optimista)
    setLiked(!prevLiked);
    setLocalLikes(prevLiked ? prevLikes - 1 : prevLikes + 1);
    setLikeLoading(true);
    try {
      const res = await api.post<{ liked: boolean; likes: number }>(\`/obras/\${obra.id}/like\`);
      // Sincronizar con el valor real del backend
      setLiked(res.data.liked);
      setLocalLikes(res.data.likes);
    } catch {
      // Revertir en caso de error
      setLiked(prevLiked);
      setLocalLikes(prevLikes);
      alert('No se pudo procesar el like. Intentá de nuevo.');
    } finally {
      setLikeLoading(false);
    }
  };

  if (error) return <div className="min-h-screen bg-abyss-bg-obras text-red-500 flex items-center justify-center p-8">{error}</div>;`;

// Find line 188
let start = -1;
for(let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// Actualizar UI al instante (optimista)')) {
        start = i;
        break;
    }
}

if (start !== -1) {
    // Delete up to the error div
    let end = start;
    for(let i = start; i < lines.length; i++) {
        if (lines[i].includes('if (error) return')) {
            end = i;
            break;
        }
    }
    
    lines.splice(start, end - start + 1, replacement);
    fs.writeFileSync('Work.tsx', lines.join('\n'));
    console.log('Successfully patched Work.tsx');
} else {
    console.log('Target not found!');
}
