import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reportId } = await req.json()
    
    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Report ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Buscar dados do relatório
    let reportData
    
    if (reportId.startsWith('insight-')) {
      // É um insight
      const insightId = reportId.replace('insight-', '')
      const { data: insight, error } = await supabase
        .from('insights')
        .select(`
          *,
          projects (
            id,
            name,
            url,
            niche
          )
        `)
        .eq('id', insightId)
        .eq('user_id', user.id)
        .single()
        
      if (error || !insight) {
        return new Response(
          JSON.stringify({ error: 'Insight not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }
      
      reportData = {
        type: 'insight',
        projectName: insight.projects.name,
        projectUrl: insight.projects.url || '',
        projectNiche: insight.projects.niche || '',
        insight: insight
      }
    } else {
      // É um relatório da tabela reports
      const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single()
        
      if (error || !report) {
        return new Response(
          JSON.stringify({ error: 'Report not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }
      
      reportData = report
    }

    // Gerar conteúdo baseado no tipo
    let content = ''
    let filename = ''
    
    if (reportData.type === 'insight') {
      // Gerar HTML para insight
      content = generateInsightHTML(reportData)
      filename = `insight-${reportData.projectName.replace(/\s+/g, '-')}.html`
    } else if (reportData.type === 'project_analysis') {
      content = generateProjectAnalysisHTML(reportData)
      filename = `analysis-${reportData.projectName?.replace(/\s+/g, '-') || 'report'}.html`
    } else if (reportData.type === 'campaign_analysis') {
      content = generateCampaignAnalysisHTML(reportData)
      filename = `performance-${reportData.campaign_name?.replace(/\s+/g, '-') || 'report'}.html`
    } else if (reportData.type === 'benchmark') {
      content = generateBenchmarkHTML(reportData)
      filename = `benchmark-${reportData.competitor_name?.replace(/\s+/g, '-') || 'report'}.html`
    } else {
      content = generateGenericHTML(reportData)
      filename = `report-${reportData.id}.html`
    }

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${filename}"`
      },
      status: 200
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function generateInsightHTML(data: any): string {
  const insight = data.insight
  const project = data.projectName
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Insight - ${project}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    h2{font-size:16px;color:#374151;margin-top:24px;margin-bottom:12px}
    .badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:9px;text-transform:uppercase;font-weight:600;margin-right:4px}
    .badge-warning{background:#fef3c7;color:#92400e}
    .badge-opportunity{background:#dbeafe;color:#1e40af}
    .badge-improvement{background:#f3f4f6;color:#374151}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
  </style>
</head>
<body>
  <h1>Insight Estratégico</h1>
  <p><strong>Projeto:</strong> ${project}</p>
  <p><strong>Data:</strong> ${new Date(insight.created_at).toLocaleDateString('pt-BR')}</p>
  
  <div class="card">
    <span class="badge badge-${insight.type}">${insight.type}</span>
    <h2>${insight.title}</h2>
    <p>${insight.description}</p>
    ${insight.action ? `<p><strong>Ação Recomendada:</strong> ${insight.action}</p>` : ''}
  </div>
  
  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`
}

function generateProjectAnalysisHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Análise de Projeto - ${data.projectName}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
  </style>
</head>
<body>
  <h1>Análise de Projeto</h1>
  <p><strong>Projeto:</strong> ${data.projectName}</p>
  <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  
  <div class="card">
    <h2>Resumo da Análise</h2>
    <p>Relatório de análise gerado pela plataforma Intentia Strategy Hub.</p>
  </div>
  
  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`
}

function generateCampaignAnalysisHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Performance - ${data.campaignName}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .score{font-size:24px;font-weight:700;color:#059669}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
  </style>
</head>
<body>
  <h1>Análise de Performance</h1>
  <p><strong>Campanha:</strong> ${data.campaignName}</p>
  <p><strong>Canal:</strong> ${data.channel}</p>
  <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  
  <div class="card">
    <h2>Score de Performance</h2>
    <div class="score">${data.score}/100</div>
  </div>
  
  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`
}

function generateBenchmarkHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Benchmark - ${data.competitorName}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .score{font-size:24px;font-weight:700;color:#7c3aed}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
  </style>
</head>
<body>
  <h1>Benchmark Competitivo</h1>
  <p><strong>Concorrente:</strong> ${data.competitorName}</p>
  <p><strong>Projeto:</strong> ${data.projectName}</p>
  <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  
  <div class="card">
    <h2>Score do Concorrente</h2>
    <div class="score">${data.score}/100</div>
  </div>
  
  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`
}

function generateGenericHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  <p><strong>Tipo:</strong> ${data.type}</p>
  <p><strong>Categoria:</strong> ${data.category}</p>
  <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  
  <div class="card">
    <h2>Relatório Gerado</h2>
    <p>Relatório gerado pela plataforma Intentia Strategy Hub.</p>
  </div>
  
  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`
}
