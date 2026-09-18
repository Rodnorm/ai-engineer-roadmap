import type { WorkspaceData } from "./types.js";

export const sampleWorkspace: WorkspaceData = {
  tasks: [
    {
      id: "task-1",
      title: "Concluir triagem técnica de candidatos para vaga de Tech Lead",
      description: "Avaliar os 8 currículos finalistas com o time de engenharia e encaminhar os 3 mais aderentes para entrevista com o CTO.",
      status: "open",
      createdAt: "2026-09-14T09:00:00.000Z",
    },
    {
      id: "task-2",
      title: "Organizar onboarding dos 4 novos colaboradores de outubro",
      description: "Verificar liberação de notebooks e acessos com TI, agendar sessões de boas-vindas e despachar kits institucionais.",
      status: "open",
      createdAt: "2026-09-15T10:30:00.000Z",
    },
    {
      id: "task-3",
      title: "Consolidar resultados da Pesquisa de Clima Organizacional (Q3)",
      description: "Montar apresentação executiva com os indicadores de eNPS, principais pontos de atenção e plano de ação por departamento.",
      status: "open",
      createdAt: "2026-09-15T14:15:00.000Z",
    },
    {
      id: "task-4",
      title: "Revisar proposta de reajuste de benefícios flexíveis",
      description: "Analisar cotações de convênios de saúde e opções de cartão multibenefícios para apresentação à diretoria.",
      status: "open",
      createdAt: "2026-09-16T11:00:00.000Z",
    },
    {
      id: "task-5",
      title: "Agendar exames médicos periódicos pendentes (PCMSO)",
      description: "Notificar colaboradores do setor de operações com exames admissionais/periódicos a vencer no final do mês.",
      status: "done",
      createdAt: "2026-09-12T08:30:00.000Z",
    },
    {
      id: "task-6",
      title: "Divulgar comunicados internos sobre o novo canal de Ouvidoria",
      description: "Publicar guia no portal interno e disparar newsletter explicando as diretrizes de sigilo e acolhimento.",
      status: "done",
      createdAt: "2026-09-13T16:00:00.000Z",
    },
  ],
  notes: [
    {
      id: "note-1",
      title: "Roteiro de Onboarding e Integração (30-60-90 dias)",
      content: "Primeira semana: Apresentação da cultura, missão, valores, entrega de equipamentos, configuração de contas e introdução ao time. Dias 15 a 30: Treinamentos práticos com padrinho/buddy e alinhamento inicial com liderança direta. 60 dias: Check-in de adaptação com o time de People. 90 dias: Avaliação formal do período de experiência e definição de metas de desenvolvimento contínuo (PDI).",
      tags: ["onboarding", "rh", "cultura", "treinamento", "people-ops"],
    },
    {
      id: "note-2",
      title: "Guia de Entrevistas Estruturadas e Critérios de Seleção",
      content: "Utilizar a metodologia STAR (Situação, Tarefa, Ação, Resultado) para condução de entrevistas comportamentais. Pilares de avaliação: autonomia, comunicação transparente, colaboração interdisciplinar e capacidade de resolução de problemas complexos. Obrigatoriedade de preenchimento dos scorecards no sistema ATS em até 24 horas após a entrevista para garantir calibração justa entre avaliadores.",
      tags: ["recrutamento", "entrevistas", "processo-seletivo", "talent-acquisition", "vagas"],
    },
    {
      id: "note-3",
      title: "Política de Trabalho Híbrido e Auxílio Home Office",
      content: "Modelo híbrido de atuação flexível (sugerido 2 dias no escritório e 3 dias remotos). Ajuda de custo mensal de R$ 250 creditada no cartão de benefícios para despesas com internet e infraestrutura doméstica. Ergonomia: reembolso único de até R$ 800 mediante apresentação de nota fiscal para aquisição de cadeira ergométrica certificada (NR-17).",
      tags: ["politicas", "home-office", "beneficios", "ergonomia", "trabalho-hibrido"],
    },
    {
      id: "note-4",
      title: "Diretrizes de Proteção de Dados de Colaboradores (LGPD & Compliance)",
      content: "Documentos admissionais, relatórios médicos (ASO) e informações bancárias são classificados como dados estritamente confidenciais. Acesso restrito apenas aos analistas responsáveis. É proibido compartilhar arquivos contendo CPF ou histórico salarial via canais de mensagens abertos ou e-mails externos. Histórico e formulários de avaliação de desempenho são arquivados com retenção de 5 anos após desligamento.",
      tags: ["compliance", "lgpd", "segurança", "security", "privacidade", "juridico"],
    },
    {
      id: "note-5",
      title: "Ciclo Semestral de Avaliação de Desempenho e Feedback 360°",
      content: "Fases do ciclo: 1. Abertura do sistema e preenchimento da autoavaliação (2 semanas); 2. Avaliação de pares cruzada e feedback da liderança imediata; 3. Reunião de calibração entre comitê de People e diretores para equalização de notas; 4. Reuniões 1:1 de devolutiva individual com elaboração de Plano de Desenvolvimento Individual (PDI).",
      tags: ["desempenho", "feedback", "pdi", "carreira", "liderança"],
    },
    {
      id: "note-6",
      title: "Tabela e Estrutura do Pacote de Benefícios Corporativos",
      content: "Convênio médico com cobertura nacional e acomodação apartamento sem coparticipação para o titular. Plano odontológico com cobertura básica e ortodôntica. Vale Alimentação / Refeição com flexibilidade de saldo. Seguro de vida coletivo no valor de 24x o salário nominal. Parceria com plataforma de academias (Gympass/TotalPass) e apoio psicológico gratuito com até 4 sessões mensais via teleconsulta.",
      tags: ["beneficios", "saude", "qualidade-de-vida", "remuneracao", "rh"],
    },
  ],
};
