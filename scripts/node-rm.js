const { rmSync } = require('node:fs');

if (!process.argv[2]) {
  console.log('No path provided');
  process.exit(1);
}

console.log('Removing', process.argv[2]);

rmSync(process.argv[2], { recursive: true, force: true });
