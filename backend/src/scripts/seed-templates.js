/**
 * Seed Templates - Import project scaffolding templates
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEMPLATES = [
  {
    name: 'HTML Project - American Palette',
    description: 'Bootstrap 5 project with American Palette flat design colors',
    category: 'web',
    language: 'HTML/CSS/JS',
    framework: 'Bootstrap 5',
    structure: `ProjectName/
├── index.html
├── assets/
│   ├── css/
│   │   └── custom.css
│   ├── js/
│   │   └── main.js
│   └── data/
│       └── config.json
├── archive/
└── README.md`,
    files: [
      { name: 'index.html', content: '<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n    <meta charset="UTF-8">\\n    <title>Project Name</title>\\n    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">\\n    <link rel="stylesheet" href="assets/css/custom.css">\\n</head>\\n<body>\\n    <div class="container mt-5">\\n        <h1>Project Name</h1>\\n    </div>\\n    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>\\n    <script src="assets/js/main.js"></script>\\n</body>\\n</html>' },
      { name: 'assets/css/custom.css', content: ':root {\\n  --electron-blue: #0984e3;\\n  --mint-leaf: #00b894;\\n  --chi-gong: #d63031;\\n  --bright-yarrow: #fdcb6e;\\n}' },
      { name: 'assets/js/main.js', content: 'document.addEventListener("DOMContentLoaded", () => {\\n    console.log("App initialized");\\n});' }
    ],
    tags: ['bootstrap', 'html', 'css', 'flat-design', 'american-palette'],
    source: 'built-in'
  },
  {
    name: 'Python Project',
    description: 'Standard Python project with virtual environment, testing, and linting',
    category: 'python',
    language: 'Python',
    framework: null,
    structure: `ProjectName/
├── src/
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── requirements.txt
├── .gitignore
└── README.md`,
    files: [
      { name: 'src/main.py', content: 'def main():\\n    print("Hello from ProjectName!")\\n\\nif __name__ == "__main__":\\n    main()' },
      { name: 'requirements.txt', content: 'numpy>=1.24.0\\npandas>=2.0.0\\npytest>=7.4.0\\nblack>=23.0.0' },
      { name: 'tests/test_main.py', content: 'import pytest\\nfrom src.main import main\\n\\ndef test_main():\\n    assert main() is None' }
    ],
    tags: ['python', 'pytest', 'virtualenv'],
    source: 'built-in'
  },
  {
    name: 'Embedded LVGL Project',
    description: 'LVGL GUI project for RP2350/ESP32-S3 with PlatformIO',
    category: 'embedded',
    language: 'C++',
    framework: 'PlatformIO',
    structure: `ProjectName/
├── src/
│   └── main.cpp
├── include/
│   └── config.h
├── lib/
├── platformio.ini
└── README.md`,
    files: [
      { name: 'src/main.cpp', content: '#include <Arduino.h>\\n#include <lvgl.h>\\n\\nvoid setup() {\\n    Serial.begin(115200);\\n    lv_init();\\n}\\n\\nvoid loop() {\\n    lv_timer_handler();\\n    delay(5);\\n}' },
      { name: 'platformio.ini', content: '[env:esp32-s3]\\nplatform = espressif32\\nboard = esp32-s3-devkitc-1\\nframework = arduino\\nlib_deps = lvgl/lvgl@^8.3.0' }
    ],
    tags: ['embedded', 'lvgl', 'esp32', 'rp2350', 'platformio'],
    source: 'built-in'
  },
  {
    name: 'Node.js Express API',
    description: 'RESTful API with Express.js, middleware, and error handling',
    category: 'web',
    language: 'JavaScript',
    framework: 'Express.js',
    structure: `ProjectName/
├── src/
│   ├── routes/
│   │   └── index.js
│   ├── middleware/
│   │   └── errorHandler.js
│   └── app.js
├── package.json
├── .env.example
└── README.md`,
    files: [
      { name: 'src/app.js', content: 'const express = require("express");\\nconst app = express();\\napp.use(express.json());\\napp.get("/health", (req, res) => res.json({ status: "ok" }));\\nmodule.exports = app;' },
      { name: 'package.json', content: '{"name": "project-name", "version": "1.0.0", "main": "src/app.js", "scripts": {"start": "node src/app.js", "dev": "nodemon src/app.js"}, "dependencies": {"express": "^4.18.2"}}' }
    ],
    tags: ['nodejs', 'express', 'api', 'rest', 'backend'],
    source: 'built-in'
  },
  {
    name: 'React TypeScript App',
    description: 'React application with TypeScript, Vite, and Tailwind CSS',
    category: 'web',
    language: 'TypeScript',
    framework: 'React + Vite',
    structure: `ProjectName/
├── src/
│   ├── components/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js`,
    files: [
      { name: 'src/App.tsx', content: 'function App() {\\n  return (\\n    <div className="min-h-screen bg-gray-100">\\n      <h1 className="text-3xl font-bold text-center py-8">Hello React</h1>\\n    </div>\\n  );\\n}\\nexport default App;' },
      { name: 'package.json', content: '{"name": "project-name", "version": "1.0.0", "scripts": {"dev": "vite", "build": "tsc && vite build"}, "dependencies": {"react": "^18.2.0", "react-dom": "^18.2.0"}}' }
    ],
    tags: ['react', 'typescript', 'vite', 'tailwind', 'frontend'],
    source: 'built-in'
  },
  {
    name: 'Docker Compose Stack',
    description: 'Multi-container Docker setup with frontend, backend, and database',
    category: 'devops',
    language: 'YAML',
    framework: 'Docker',
    structure: `ProjectName/
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── nginx.conf
├── frontend/
├── backend/
├── docker-compose.yml
└── .env.example`,
    files: [
      { name: 'docker-compose.yml', content: 'version: "3.8"\\nservices:\\n  frontend:\\n    build: ./docker/Dockerfile.frontend\\n    ports: ["3000:3000"]\\n  backend:\\n    build: ./docker/Dockerfile.backend\\n    ports: ["8080:8080"]\\n  db:\\n    image: postgres:15\\n    environment:\\n      POSTGRES_DB: app' }
    ],
    tags: ['docker', 'compose', 'devops', 'containers', 'nginx'],
    source: 'built-in'
  }
];

async function seedTemplates() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Templates Seed Script                                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('🗑️  Clearing existing templates...');
  await prisma.template.deleteMany({});

  console.log('\n📥 Seeding templates...\n');
  for (const template of TEMPLATES) {
    await prisma.template.create({ data: template });
    console.log(`✅ Created: ${template.name} (${template.category})`);
  }

  const total = await prisma.template.count();
  const byCategory = await prisma.template.groupBy({ by: ['category'], _count: true });

  console.log('\n' + '='.repeat(60));
  console.log('📊 Seed Summary');
  console.log('='.repeat(60));
  console.log(`✅ Total templates: ${total}`);
  console.log('\n📂 By Category:');
  byCategory.forEach(cat => console.log(`   ${cat.category}: ${cat._count}`));
  console.log('\n✨ Seed complete!\n');
}

seedTemplates()
  .catch(e => { console.error('Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
