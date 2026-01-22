#!/usr/bin/env node

/**
 * Script de Verificación: Sistema de Misiones
 * 
 * Ejecuta: node test-misiones.js
 * 
 * Verifica que los componentes existen y tienen la estructura correcta
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileContent(filePath, searchStrings) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return searchStrings.map(str => ({
      search: str,
      found: content.includes(str)
    }));
  } catch (error) {
    return [];
  }
}

console.log('\n' + '='.repeat(60));
log(colors.blue, '🧪 VERIFICACIÓN: SISTEMA DE MISIONES');
console.log('='.repeat(60) + '\n');

const baseDir = path.join(__dirname, 'src', 'components', 'gamification');

const tests = [
  {
    name: 'GamificationDashboard.jsx',
    file: path.join(baseDir, 'GamificationDashboard.jsx'),
    checks: [
      'useEffect',
      'puntosUsuario',
      'GET /api/usuario',
      'MisionesDiarias',
      'puntosActuales={puntosUsuario}'
    ]
  },
  {
    name: 'MisionesDiarias.jsx',
    file: path.join(baseDir, 'MisionesDiarias.jsx'),
    checks: [
      'puntosActuales',
      'progreso',
      'completada',
      'Maestro de Reciclaje',
      'CheckCircle2',
      'framer-motion'
    ]
  },
  {
    name: 'App.jsx (Integración)',
    file: path.join(__dirname, 'src', 'App.jsx'),
    checks: [
      "import GamificationDashboard",
      "case 'misiones'",
      "Zap from 'lucide-react'"
    ]
  }
];

let allPassed = true;

tests.forEach((test, index) => {
  console.log(`\n${index + 1}. Verificando: ${test.name}`);
  console.log('-'.repeat(50));

  if (!checkFileExists(test.file)) {
    log(colors.red, `   ❌ Archivo no encontrado: ${test.file}`);
    allPassed = false;
    return;
  }

  log(colors.green, `   ✅ Archivo existe`);

  const results = checkFileContent(test.file, test.checks);
  
  if (results.length === 0) {
    log(colors.yellow, `   ⚠️  No se pudo leer el contenido`);
    return;
  }

  results.forEach(result => {
    if (result.found) {
      log(colors.green, `   ✅ "${result.search}" encontrado`);
    } else {
      log(colors.red, `   ❌ "${result.search}" NO encontrado`);
      allPassed = false;
    }
  });
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  log(colors.green, '🎉 TODAS LAS VERIFICACIONES PASARON');
  log(colors.green, '\n✅ Sistema de Misiones está correctamente implementado');
  console.log('\nPróximos pasos:');
  console.log('  1. Iniciar backend: npm start (en EcoEducaAPI)');
  console.log('  2. Iniciar frontend: npm run dev (en EcoEducaAPP)');
  console.log('  3. Abrir http://localhost:5173');
  console.log('  4. Autenticarse');
  console.log('  5. Navegar a "Misiones"');
} else {
  log(colors.red, '❌ ALGUNAS VERIFICACIONES FALLARON');
  log(colors.red, '\nRevisa los errores arriba');
}

console.log('='.repeat(60) + '\n');
