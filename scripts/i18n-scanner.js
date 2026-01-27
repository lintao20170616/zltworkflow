const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SCAN_DIR = path.join(__dirname, '../client/spa/apps/default');
const DEFAULT_JSON_PATH = path.join(__dirname, '../client/spa/apps/default/i18n/locales/default.json');

function isChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

function extractTextFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const texts = new Set();

  const patterns = [/\$t\(['"]([^'"]+)['"]\)/g, /t\(['"]([^'"]+)['"]\)/g, /this\.\$t\(['"]([^'"]+)['"]\)/g];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1];
      if (isChinese(text)) {
        texts.add(text);
      }
    }
  });

  return Array.from(texts);
}

function scanDirectory(dir, extensions = ['.vue', '.ts', '.js']) {
  const results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results.push(...scanDirectory(filePath, extensions));
      }
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      const texts = extractTextFromFile(filePath);
      if (texts.length > 0) {
        results.push({
          file: filePath,
          texts,
        });
      }
    }
  }

  return results;
}

function generateDefaultJson(scanResults) {
  const existingDefault = fs.existsSync(DEFAULT_JSON_PATH) ? JSON.parse(fs.readFileSync(DEFAULT_JSON_PATH, 'utf-8')) : {};

  const reverseMap = {};
  Object.entries(existingDefault).forEach(([uuid, text]) => {
    reverseMap[text] = uuid;
  });

  const allTexts = new Set();
  scanResults.forEach((result) => {
    result.texts.forEach((text) => allTexts.add(text));
  });

  allTexts.forEach((text) => {
    if (!reverseMap[text]) {
      reverseMap[text] = uuidv4();
    }
  });

  const defaultJson = {};
  Object.entries(reverseMap).forEach(([text, uuid]) => {
    defaultJson[uuid] = text;
  });

  return defaultJson;
}

function main() {
  console.log('开始扫描 i18n $t 函数中的中文文案...');
  console.log(`扫描目录: ${SCAN_DIR}`);

  const scanResults = scanDirectory(SCAN_DIR);
  console.log(`找到 ${scanResults.length} 个文件包含中文文案`);

  const totalTexts = new Set();
  scanResults.forEach((result) => {
    result.texts.forEach((text) => totalTexts.add(text));
  });

  console.log(`共找到 ${totalTexts.size} 个唯一的中文文案`);

  const defaultJson = generateDefaultJson(scanResults);

  fs.writeFileSync(DEFAULT_JSON_PATH, JSON.stringify(defaultJson, null, 2), 'utf-8');
  console.log(`已生成 default.json，包含 ${Object.keys(defaultJson).length} 个翻译键`);
  console.log(`文件路径: ${DEFAULT_JSON_PATH}`);
}

main();
