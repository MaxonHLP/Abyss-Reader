const fs = require('fs');
let code = fs.readFileSync('Work.tsx', 'utf-8');

const target1 = `    // Actualizar UI al instante (optimista)
    setLiked(!prevLiked);


  if (error) return <div className="min-h-screen bg-abyss-bg-obras text-red-500 flex items-center justify-center p-8">{error}</div>;`;

const target2 = `    // Actualizar UI al instante (optimista)\r
    setLiked(!prevLiked);\r
\r
\r
  if (error) return <div className="min-h-screen bg-abyss-bg-obras text-red-500 flex items-center justify-center p-8">{error}</div>;`;

const target3 = `    // Actualizar UI al instante (optimista)\n    setLiked(!prevLiked);\n\n\n  if (error) return <div className="min-h-screen bg-abyss-bg-obras text-red-500 flex items-center justify-center p-8">{error}</div>;`;

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

let modified = false;
if (code.includes(target1)) { code = code.replace(target1, replacement); modified = true; }
else if (code.includes(target2)) { code = code.replace(target2, replacement); modified = true; }
else if (code.includes(target3)) { code = code.replace(target3, replacement); modified = true; }
else {
    console.log("Target not found!");
}

if (modified) {
    fs.writeFileSync('Work.tsx', code);
    console.log('Successfully patched Work.tsx');
}
