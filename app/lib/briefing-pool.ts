export type BriefingItem = {
  category: string;
  title: string;
  text: string;
  relevance: string;
};

export type Briefing = {
  generatedAt: string;
  dateKey: string;
  source: "ai" | "pool";
  items: BriefingItem[];
  reflection: string;
  recommendation: string;
};

export const briefingPool: BriefingItem[] = [
  {
    category: "Finanças pessoais",
    title: "O dinheiro parado também perde valor",
    text: "Quando a inflação sobe, o dinheiro numa conta à ordem pode comprar menos no futuro, mesmo que o número seja o mesmo.",
    relevance:
      "Poupar é essencial, mas aprender a investir é necessário para proteger o teu poder de compra.",
  },
  {
    category: "Psicologia",
    title: "O viés de confirmação engana-te todos os dias",
    text: "Tendemos a procurar informação que confirma o que já acreditamos e a ignorar sinais que contradizem essa crença.",
    relevance:
      "Estar consciente disto ajuda-te a discutir melhor, decidir melhor e não cair em manipulação.",
  },
  {
    category: "História",
    title: "Roma não caiu num dia",
    text: "O Império Romano do Ocidente foi enfraquecendo durante séculos por problemas políticos, económicos, militares e sociais.",
    relevance: "Grandes sistemas raramente colapsam por uma única razão.",
  },
  {
    category: "Tecnologia",
    title: "A cloud é o computador de outra pessoa",
    text: "Quando guardas algo na cloud, os dados ficam em servidores físicos espalhados por centros de dados.",
    relevance:
      "A Internet parece invisível, mas depende de energia, cabos, máquinas e segurança real.",
  },
  {
    category: "Negociação",
    title: "Quem tem mais alternativas tem mais poder",
    text: "Numa negociação, a tua força não vem só do que pedes, mas da tua capacidade de sair sem aceitar um mau acordo.",
    relevance:
      "Aplica-se a salários, compras, vendas, contratos e até relações pessoais.",
  },
  {
    category: "Ciência",
    title: "A luz do Sol demora 8 minutos a chegar",
    text: "Quando olhas para o Sol, vês luz que saiu de lá há minutos, não naquele instante.",
    relevance: "Olhar para o espaço é literalmente olhar para o passado.",
  },
  {
    category: "Comunicação",
    title: "Pausas dão força às palavras",
    text: "Quem comunica bem usa pausas para criar atenção, peso e clareza, em vez de falar sempre depressa.",
    relevance:
      "Útil em reuniões, apresentações, vendas, negociações e conversas difíceis.",
  },
  {
    category: "Biologia",
    title: "Tens mais bactérias do que células humanas",
    text: "O microbioma influencia digestão, imunidade e possivelmente humor e comportamento.",
    relevance:
      "O ser humano não é um organismo isolado — é um ecossistema vivo.",
  },
  {
    category: "Geopolítica",
    title: "Estreitos marítimos valem mais que minas de ouro",
    text: "Locais como o Estreito de Ormuz ou o Canal do Suez controlam a passagem de energia e mercadorias.",
    relevance:
      "Explica porque certos pontos no mapa têm enorme importância política e militar.",
  },
  {
    category: "Filosofia",
    title: "Saber muito não é pensar bem",
    text: "Podes memorizar factos e mesmo assim raciocinar mal. Pensar bem exige lógica, humildade e capacidade de mudar de opinião.",
    relevance: "Pensamento crítico vale mais do que acumular informação.",
  },
  {
    category: "Marketing",
    title: "As marcas vendem identidade, não produtos",
    text: "Muita gente compra certas marcas para pertencer a uma imagem, estilo ou grupo social.",
    relevance:
      "Entender isto ajuda-te a ver publicidade, luxo e consumo com outros olhos.",
  },
  {
    category: "Matemática aplicada",
    title: "Probabilidade não é intuição",
    text: "A cabeça humana é má a estimar riscos. Temos medo de eventos raros e ignoramos perigos comuns.",
    relevance:
      "Importante para decisões sobre dinheiro, saúde, segurança e investimentos.",
  },
  {
    category: "Poesia",
    title: "Um poema curto diz mais que um texto enorme",
    text: "A poesia condensa emoção, imagem e pensamento em poucas palavras.",
    relevance: "Treina a sensibilidade e a capacidade de ver no detalhe.",
  },
  {
    category: "Aviação",
    title: "Checklists batem confiança",
    text: "Pilotos seguem checklists mesmo com milhares de horas de voo, porque a memória humana falha.",
    relevance: "Em qualquer área, sistemas vencem confiança excessiva.",
  },
  {
    category: "Cibersegurança",
    title: "Os ataques começam em pessoas, não em código",
    text: "Phishing, engenharia social e passwords fracas continuam a ser as portas de entrada mais comuns.",
    relevance: "Segurança digital é educação, hábitos e desconfiança saudável.",
  },
  {
    category: "Espaço",
    title: "Saturno flutuaria em água",
    text: "A densidade de Saturno é tão baixa (~0,69 g/cm³) que, num oceano gigante, flutuaria.",
    relevance: "Mostra como a intuição falha em escalas que não vemos.",
  },
  {
    category: "Inteligência Artificial",
    title: "Os modelos não 'sabem' — preveem palavras",
    text: "LLMs como o ChatGPT preveem o próximo token mais provável, com base em padrões aprendidos.",
    relevance:
      "Entender isto evita confiares cegamente nas respostas — alucinam quando o padrão falha.",
  },
  {
    category: "Liderança",
    title: "Líderes fortes admitem erros",
    text: "Estudos mostram que líderes que reconhecem falhas geram mais confiança e equipas mais eficazes.",
    relevance:
      "Vulnerabilidade calculada não é fraqueza — é uma ferramenta de poder.",
  },
  {
    category: "Manipulação",
    title: "A técnica do 'pé na porta'",
    text: "Quem aceita um pedido pequeno fica mais propenso a aceitar um maior depois, por coerência interna.",
    relevance:
      "Usada por vendedores e cultos — saber identificar protege-te.",
  },
  {
    category: "Linguagem corporal",
    title: "Os olhos revelam mais que a boca",
    text: "Direção do olhar, dilatação das pupilas e tempo de contacto visual são sinais difíceis de falsificar.",
    relevance:
      "Útil em negociações, encontros e leitura de intenções escondidas.",
  },
  {
    category: "Empreendedorismo",
    title: "A maioria dos negócios morre por falta de clientes, não de produto",
    text: "Equipas técnicas tendem a polir o produto antes de validar se alguém o quer comprar.",
    relevance:
      "Falar com clientes cedo é mais valioso do que mais uma funcionalidade.",
  },
  {
    category: "Longevidade",
    title: "Caminhar 7-10 mil passos reduz mortalidade",
    text: "Estudos com centenas de milhares de pessoas mostram quedas significativas na mortalidade a partir destes níveis.",
    relevance: "Pequenos hábitos diários batem grandes esforços esporádicos.",
  },
  {
    category: "Sobrevivência",
    title: "Regra dos 3 da sobrevivência",
    text: "3 minutos sem ar, 3 horas sem abrigo em frio, 3 dias sem água, 3 semanas sem comida.",
    relevance: "Prioriza recursos quando algo corre mal — ar > calor > água > comida.",
  },
  {
    category: "Hábitos",
    title: "Sistemas batem objetivos",
    text: "Quem se foca em sistemas diários (escrever 30min, treinar 3x semana) chega mais longe que quem só define objetivos.",
    relevance:
      "Os objetivos dizem onde queres ir; os sistemas levam-te até lá.",
  },
  {
    category: "Paradoxos",
    title: "Paradoxo de Fermi",
    text: "Se o universo é tão vasto e antigo, porque ainda não detetámos vida inteligente extraterrestre?",
    relevance:
      "Levanta hipóteses fascinantes: filtros cósmicos, raridade da vida, zoológicos galácticos.",
  },
  {
    category: "Curiosidades",
    title: "O mel não estraga",
    text: "Mel encontrado em túmulos egípcios com 3 mil anos ainda estava comestível, graças ao pH baixo e à falta de água.",
    relevance: "É o único alimento natural que praticamente não se degrada.",
  },
  {
    category: "Crimes famosos",
    title: "A morte de Notorious B.I.G. nunca foi resolvida",
    text: "Apesar de décadas, o assassínio em 1997 continua oficialmente por resolver, com teorias envolvendo gangues e polícias de LA.",
    relevance: "Casos mediáticos podem ficar sem resposta durante gerações.",
  },
  {
    category: "Frases históricas",
    title: "\"Vim, vi, venci\" — Júlio César",
    text: "Escrito num relatório ao senado romano após uma vitória relâmpago contra Pharnaces II em 47 a.C.",
    relevance: "Modelo de comunicação direta e impacto máximo com mínimo de palavras.",
  },
  {
    category: "Animais",
    title: "Os polvos têm 9 cérebros",
    text: "Um cérebro central e um mini-cérebro em cada braço, que toma decisões locais.",
    relevance:
      "Mostra que a inteligência pode existir em formas radicalmente diferentes da nossa.",
  },
  {
    category: "Oceanos",
    title: "Conhecemos melhor o espaço que o fundo do mar",
    text: "Apenas ~25% do leito oceânico foi mapeado em alta resolução. Muitas espécies abissais ainda nem têm nome.",
    relevance: "A última grande fronteira do planeta está aqui em baixo.",
  },
  {
    category: "Religião",
    title: "O cristianismo nasceu como uma seita judaica",
    text: "Nos primeiros anos, os seguidores de Jesus continuavam a frequentar o Templo e a observar leis judaicas.",
    relevance:
      "Entender raízes históricas evita simplificações sobre culturas e crenças.",
  },
  {
    category: "Cinema",
    title: "O som no espaço é mentira (mas funciona)",
    text: "No vácuo não há propagação de som. Filmes acrescentam-no porque o silêncio reduz tensão emocional.",
    relevance:
      "Mostra como narrativa muitas vezes ganha à física — atenção a isto em qualquer comunicação.",
  },
  {
    category: "Música",
    title: "O 'efeito Mozart' é em grande parte mito",
    text: "Estudos posteriores não replicaram o aumento de QI prometido nos anos 90.",
    relevance:
      "Útil para treinar ceticismo perante alegações que viralizaram sem replicação.",
  },
  {
    category: "Arte",
    title: "A Mona Lisa só ficou famosa após o roubo",
    text: "Em 1911 foi roubada do Louvre e a cobertura mediática durante 2 anos lançou-a no imaginário global.",
    relevance: "A fama nem sempre vem de mérito — vem de narrativa e atenção.",
  },
  {
    category: "Leis estranhas",
    title: "Na Suíça é ilegal ter um único porquinho-da-índia",
    text: "Por serem animais sociais, a lei exige que vivam em pares para o bem-estar.",
    relevance:
      "Mostra como diferentes sociedades codificam valores em lei de formas inesperadas.",
  },
  {
    category: "Descobertas recentes",
    title: "Existem rios subterrâneos enormes na Amazónia",
    text: "Cientistas detetaram um sistema fluvial a milhares de metros abaixo do rio Amazonas.",
    relevance: "Há geografia oculta debaixo dos nossos pés, ainda mal compreendida.",
  },
  {
    category: "Tendências futuras",
    title: "Energia solar já é a forma mais barata de eletricidade em muitos países",
    text: "Custos caíram >90% em 15 anos. Continua a cair.",
    relevance:
      "Quem perceber isto cedo decide melhor sobre carreiras, investimentos e geopolítica.",
  },
  {
    category: "Erros cognitivos",
    title: "Falácia do custo afundado",
    text: "Continuamos coisas más porque já investimos tempo/dinheiro, mesmo quando sair seria melhor.",
    relevance: "Está em relações, projetos, carreiras e investimentos — caro em todos.",
  },
  {
    category: "Truques mentais",
    title: "Regra dos 10/10/10",
    text: "Antes de decidir, pergunta: como me vou sentir daqui a 10 minutos, 10 meses, 10 anos?",
    relevance: "Reduz decisões impulsivas com pouco custo cognitivo.",
  },
  {
    category: "Dinheiro e poder",
    title: "Quem controla a infra-estrutura, controla a economia",
    text: "Cabos submarinos, cloud, payment rails, semicondutores — o poder real está em camadas invisíveis.",
    relevance:
      "Vê o mundo em camadas: produto → plataforma → infra-estrutura → energia.",
  },
];

export const reflectionPool: string[] = [
  "Que ideia aprendida hoje podes aplicar numa conversa, decisão ou problema real ainda esta semana?",
  "Em que área da tua vida estás a confundir 'esforço' com 'progresso'?",
  "Que decisão antiga continuas a defender mais por orgulho do que por razão?",
  "Que pessoa pensa muito diferente de ti e te poderia ensinar algo se a ouvisses sem refutar?",
  "Se tiveres de explicar a tua semana a alguém em 3 frases, o que dirias?",
  "Onde estás a ignorar dados porque te incomodam?",
  "O que farias se soubesses que ninguém iria julgar?",
];

export const recommendationPool: string[] = [
  "Explora o conceito de **modelos mentais** — ferramentas de pensamento usadas para entender dinheiro, poder, risco e sistemas complexos.",
  "Lê *Thinking, Fast and Slow* de Daniel Kahneman — base para entender erros cognitivos.",
  "Vê o documentário *The Social Dilemma* — sobre como as redes sociais moldam o comportamento.",
  "Pesquisa **Razor de Hanlon**: não atribuas à malícia o que pode ser explicado por estupidez ou incompetência.",
  "Lê *Sapiens* de Yuval Noah Harari — uma vista panorâmica da história humana.",
  "Explora o canal Veritasium no YouTube — ciência explicada de forma fascinante.",
  "Lê *Influence* de Robert Cialdini — manual de como funcionam persuasão e manipulação.",
  "Vê a série *Cosmos* de Carl Sagan ou Neil deGrasse Tyson.",
  "Pesquisa o conceito de **Lindy effect**: o que sobrevive há muito tempo tende a continuar a sobreviver.",
];

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function matchesPreferred(item: BriefingItem, preferred: string[]): boolean {
  if (preferred.length === 0) return true;
  const cat = item.category.toLowerCase();
  return preferred.some((p) => {
    const lp = p.toLowerCase();
    return cat.includes(lp) || lp.includes(cat);
  });
}

export function buildPoolBriefing(
  dateKey: string,
  preferredTopics: string[] = []
): Briefing {
  let candidates = briefingPool;
  if (preferredTopics.length > 0) {
    const filtered = briefingPool.filter((item) =>
      matchesPreferred(item, preferredTopics)
    );
    if (filtered.length >= 6) {
      candidates = filtered;
    }
  }

  const items = pickRandom(candidates, Math.min(12, candidates.length));
  const [reflection] = pickRandom(reflectionPool, 1);
  const [recommendation] = pickRandom(recommendationPool, 1);
  return {
    generatedAt: new Date().toISOString(),
    dateKey,
    source: "pool",
    items,
    reflection,
    recommendation,
  };
}
