const fs = require('fs');
let code = fs.readFileSync('c:\\facuGood\\practicas profecionales\\Abyss Reader\\pagina\\front\\src\\pages\\ChapterReader.tsx', 'utf-8');

const brokenCode1 = `  return (
        </h1>
        <p
          className="mt-2 text-lg font-semibold"`;

const fixedCode1 = `  return (
    <>
      <Navbar />
      <div
        ref={topRef}
        className="min-h-screen flex flex-col items-center"
        style={{ background: 'var(--color-abyss-bg-fondo-capitulos)' }}
      >
        <div className="w-full flex flex-col items-center pt-8 pb-2 px-4">
          <h1
            className="text-3xl md:text-4xl font-bold text-center tracking-wide"
            style={{ color: 'var(--color-abyss-text-capitulos)' }}
          >
            {tituloFormateado}
          </h1>
          <p
            className="mt-2 text-lg font-semibold"`;

const brokenCode2 = brokenCode1.replace(/\n/g, '\r\n');
if (code.includes(brokenCode1)) {
    code = code.replace(brokenCode1, fixedCode1);
} else if (code.includes(brokenCode2)) {
    code = code.replace(brokenCode2, fixedCode1);
}

const brokenCodeBottom = `        </div>
      </div>
  );
}`;
const fixedCodeBottom = `        </div>
      </div>
    </>
  );
}`;
const brokenCodeBottom2 = brokenCodeBottom.replace(/\n/g, '\r\n');
if (code.includes(brokenCodeBottom)) {
    code = code.replace(brokenCodeBottom, fixedCodeBottom);
} else if (code.includes(brokenCodeBottom2)) {
    code = code.replace(brokenCodeBottom2, fixedCodeBottom);
}

fs.writeFileSync('c:\\facuGood\\practicas profecionales\\Abyss Reader\\pagina\\front\\src\\pages\\ChapterReader.tsx', code);
console.log("Fixed syntax");
