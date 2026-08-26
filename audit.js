const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const report = [];
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  const hasScript = content.includes('unpkg.com/lucide');
  const hasCreate = content.includes('lucide.createIcons');
  
  const emojis = new Set();
  let match;
  while ((match = emojiRegex.exec(content)) !== null) {
    emojis.add(match[0]);
  }
  const emojiList = Array.from(emojis).join(' ');

  const numDivOpen = (content.match(/<div/g) || []).length;
  const numDivClose = (content.match(/<\/div>/g) || []).length;
  const divDiff = numDivOpen - numDivClose;
  
  const numSectionOpen = (content.match(/<section/g) || []).length;
  const numSectionClose = (content.match(/<\/section>/g) || []).length;
  
  report.push("File: " + file);
  report.push("  - Lucide Script: " + hasScript);
  report.push("  - Lucide Create Call: " + hasCreate);
  report.push("  - Remaining Emojis/Symbols: " + emojiList);
  report.push("  - Unclosed DIVs (approx): " + (divDiff !== 0 ? divDiff : "OK"));
  report.push("  - Unclosed SECTIONs: " + (numSectionOpen !== numSectionClose ? numSectionOpen - numSectionClose : "OK"));
  report.push("--------------------------------------");
}

fs.writeFileSync('audit_report.txt', report.join('\n'), 'utf8');
console.log('Audit complete, report saved to audit_report.txt');
