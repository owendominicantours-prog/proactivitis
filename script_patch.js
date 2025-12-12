const { readFileSync, writeFileSync } = require('fs');
const path = 'components/supplier/SupplierTourCreateForm.tsx';
let text = readFileSync(path, 'utf8');
const start = text.indexOf('<span>Duraci');
const end = text.indexOf('</label>', start) + '</label>'.length;
