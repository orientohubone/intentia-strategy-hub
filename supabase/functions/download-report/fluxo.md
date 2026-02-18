// 1. Usuário clica no download
// 2. Chama Edge Function
const { data } = await supabase.functions.invoke('download-report', {
  body: { reportId }
});

// 3. Se retornar HTML, faz download automático
if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
  const blob = new Blob([data], { type: 'text/html' });
  // ... download automático
}