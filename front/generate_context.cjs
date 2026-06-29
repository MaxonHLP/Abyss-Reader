const fs = require('fs');
const path = require('path');

// Rutas base
const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const outputFile = path.join(rootDir, 'frontend_context.md');

// Extensiones de archivos que queremos incluir (código puro)
const validExtensions = ['.ts', '.tsx', '.css'];

// Carpetas o archivos a ignorar para no hacer ruido innecesario
const ignoreList = ['node_modules', 'dist', 'build', '.git', 'assets'];

/**
 * Recorre recursivamente una carpeta y devuelve un array con todas las rutas de los archivos válidos
 */
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    
    // Ignorar carpetas no relevantes
    if (ignoreList.some(ignoreItem => fullPath.includes(path.sep + ignoreItem))) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (validExtensions.includes(path.extname(file))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Función principal para generar el markdown
 */
function generateMarkdown() {
  console.log(`Escaneando código en: ${srcDir}...`);
  
  try {
    const files = getAllFiles(srcDir);
    
    let markdownContent = '# Contexto del Frontend - Abyss Reader\n\n';
    markdownContent += 'Este documento contiene el código fuente completo de los componentes, páginas, servicios y stores del frontend. Está diseñado para proporcionar a la IA el contexto total sobre el flujo de navegación, consumo de APIs y manejo de estado global.\n\n';

    files.forEach(file => {
      // Ruta relativa para que sea más legible en el documento (ej: src/pages/Home.tsx)
      const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
      
      // Obtener la extensión sin el punto para el bloque de código (ts, tsx, css)
      let ext = path.extname(file).substring(1);
      
      const content = fs.readFileSync(file, 'utf8');

      markdownContent += `---\n\n`;
      markdownContent += `## Archivo: \`${relativePath}\`\n\n`;
      markdownContent += '```' + ext + '\n';
      markdownContent += content + '\n';
      markdownContent += '```\n\n';
    });

    fs.writeFileSync(outputFile, markdownContent, 'utf8');
    
    console.log('----------------------------------------------------');
    console.log(`✅ ¡Documento generado exitosamente!`);
    console.log(`📄 Se procesaron ${files.length} archivos relevantes (.ts, .tsx, .css).`);
    console.log(`📁 El archivo se ha guardado en: ${outputFile}`);
    console.log('----------------------------------------------------');
    
  } catch (error) {
    console.error('Ocurrió un error al generar el archivo:', error);
  }
}

generateMarkdown();
