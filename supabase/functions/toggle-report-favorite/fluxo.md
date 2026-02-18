// 1. Usuário clica na estrela
// 2. Chama Edge Function
const { data, error } = await supabase.functions.invoke('toggle-report-favorite', {
  body: { reportId, isFavorite: !current.isFavorite }
});

// 3. Atualiza estado local
setReports(prev => prev.map(r => 
  r.id === reportId ? { ...r, isFavorite: !r.isFavorite } : r
));