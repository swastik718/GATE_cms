const fs = require('fs');
const path = require('path');

const targetName = "Gandhi Academy of technology and engineering(GATE)";

const replacements = [
  { match: /ABC\s*SCHOOL/gi, replace: targetName },
  { match: /MOM\s*School\s*of\s*Excellenc[ey]/gi, replace: targetName },
  { match: /School\s*of\s*Excellence/gi, replace: targetName },
  { match: /School\s*Management\s*System/gi, replace: "College Management System" },
  { match: /school\s*management\s*system/gi, replace: "college management system" },
  // the word school with boundaries
  { match: /\bschool\b/g, replace: "college" },
  { match: /\bSchool\b/g, replace: "College" },
  { match: /\bSCHOOL\b/g, replace: "COLLEGE" },
];

function processFile(filePath) {
  // STRICTLY EXCLUDE firebase.js
  if (filePath.includes('firebase.js') || filePath.includes('firebase.ts')) {
    console.log(`Skipping firebase config: ${filePath}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const r of replacements) {
      content = content.replace(r.match, r.replace);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        traverseDir(fullPath);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html')) {
        processFile(fullPath);
      }
    }
  }
}

// Ensure running the right dir
const projectRoot = __dirname;
console.log(`Running in project root: ${projectRoot}`);
traverseDir(path.join(projectRoot, 'src'));
processFile(path.join(projectRoot, 'index.html'));
processFile(path.join(projectRoot, 'package.json'));

console.log("Replacement complete.");
