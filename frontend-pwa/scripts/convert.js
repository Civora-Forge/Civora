import fs from 'fs';
import path from 'path';
import * as babel from '@babel/core';
import prettier from 'prettier';

const srcDir = path.join(process.cwd(), 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const files = [];
walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    files.push(filePath);
  }
});

async function processFiles() {
  for (const filePath of files) {
    const isTSX = filePath.endsWith('.tsx');
    const newExt = isTSX ? '.jsx' : '.js';
    const newPath = filePath.replace(/\.tsx?$/, newExt);

    // Transform code to remove TS
    const code = fs.readFileSync(filePath, 'utf-8');
    const result = await babel.transformAsync(code, {
      filename: filePath,
      presets: [
        ["@babel/preset-typescript", { isTSX: true, allExtensions: true }]
      ],
      plugins: ["@babel/plugin-syntax-jsx"],
      retainLines: true
    });

    if (result && result.code) {
      // Fix imports
      let newCode = result.code.replace(/\.tsx?['"]/g, match => {
        return match.includes('tsx') ? ".jsx" + match.slice(-1) : ".js" + match.slice(-1);
      });
      
      // Clean up empty types
      if (filePath.includes('api.ts') || filePath.includes('domain.ts')) {
          newCode = "export {};\n" + newCode.replace(/export {}/g, ""); // clear empty files
      }

      // Format code
      try {
        newCode = await prettier.format(newCode, { parser: 'babel' });
      } catch (e) {
        console.error('Prettier failed on', filePath);
      }

      fs.writeFileSync(newPath, newCode);
      fs.unlinkSync(filePath);
      console.log(`Converted ${filePath} -> ${newPath}`);
    }
  }
}

processFiles().catch(console.error);
