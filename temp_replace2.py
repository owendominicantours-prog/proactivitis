# -*- coding: utf-8 -*-
from pathlib import Path
path = Path('app/(public)/layout.tsx')
text = path.read_text(encoding='cp1252')
text = text.replace('\u00b8', '\u00a9')
path.write_text(text, encoding='utf-8')
