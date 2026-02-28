#!/bin/bash
# Script para remover console.log e sanitizar console.error usando sed em todo o diretório src/
# Exclui o arquivo src/main.tsx pois ele tem a regra customizada

# Remove ou comenta console.log e console.debug (apenas linhas que não têm log warning)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "main.tsx" -print0 | xargs -0 sed -i -E 's/^[[:space:]]*console\.(log|debug)\(.*\);?[[:space:]]*$/\/\/ \0/'

# Substitui console.error("mensagem", err) por console.error("mensagem", err?.message || err)
# Essa é uma expressão regular mais restritiva para sanitizar os outputs mais comuns
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "main.tsx" -print0 | xargs -0 perl -pi -e 's/console\.error\(([^,]+),\s*([a-zA-Z0-9_]+)\)/console.error($1, $2?.message || "Unknown error")/g'

# Cobre casos com erro.error (como Supabase)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "main.tsx" -print0 | xargs -0 perl -pi -e 's/console\.error\(([^,]+),\s*([a-zA-Z0-9_]+)\.error\)/console.error($1, $2.error?.message || "Unknown error")/g'
