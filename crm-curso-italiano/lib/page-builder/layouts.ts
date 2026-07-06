import type { PageSection, SavedLayout } from "@lms-mocks/page-builder-types";
import { createColumn, createComponent, createSection, pbId } from "./defaults";
import { normalizeColumn } from "./document";

function cloneSection(section: PageSection): PageSection {
  return JSON.parse(JSON.stringify(section)) as PageSection;
}

function styledHeading(text: string, level = 2) {
  return {
    ...createComponent("heading"),
    props: { text, level },
    style: { typography: { fontWeight: 700, fontSize: level === 2 ? 28 : 22 }, color: "#1e3a5f" },
  };
}

function styledParagraph(text: string) {
  return { ...createComponent("paragraph"), props: { text } };
}

/** Layouts pedagógicos completos — base para aulas de idiomas */
export const LAYOUT_TEMPLATES: SavedLayout[] = [
  {
    id: "layout-video-aula",
    name: "Aula em vídeo",
    category: "Vídeo-aula",
    description: "Vídeo em destaque, áudio, frase-chave e material complementar",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Cabeçalho", 1),
        style: {
          padding: { top: 24, bottom: 16, left: 24, right: 24 },
          backgroundColor: "#dbeafe",
          align: "center",
          typography: { textAlign: "center" },
        },
        columns: [
          createColumn(12, [
            styledHeading("Título da aula", 2),
            styledParagraph("Breve introdução ao conteúdo desta aula em vídeo."),
          ]),
        ],
      },
      {
        ...createSection("Vídeo principal", 1),
        style: { gap: 24, padding: { top: 24, bottom: 24, left: 16, right: 16 }, maxWidth: "wide" },
        columns: [
          createColumn(12, [
            createComponent("video"),
            {
              ...createComponent("callout"),
              props: {
                variant: "info",
                title: "",
                text: '"What are you gonna do now? Call the police?"',
              },
              style: { backgroundColor: "#eff6ff", borderRadius: 12, padding: { top: 16, bottom: 16, left: 20, right: 20 } },
            },
            styledParagraph(
              "Assista ao vídeo e preste atenção nas expressões de tempo e nas construções com <em>Present Continuous</em> para o futuro.",
            ),
          ]),
        ],
      },
      {
        ...createSection("Material complementar", 2),
        style: { gap: 16, padding: { bottom: 24 } },
        columns: [
          createColumn(6, [createComponent("file-download")]),
          createColumn(6, [
            {
              ...createComponent("callout"),
              props: {
                variant: "tip",
                title: "Mind the gap",
                text: "Tomorrow, Next week, In an hour, Soon, Later this evening.",
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-video-vocabulario",
    name: "Vídeo + vocabulário",
    category: "Vídeo-aula",
    description: "Vídeo em destaque com caixa de vocabulário lateral e frases-chave",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Cabeçalho", 1),
        style: {
          padding: { top: 24, bottom: 16, left: 24, right: 24 },
          backgroundColor: "#dbeafe",
          align: "center",
          typography: { textAlign: "center" },
        },
        columns: [
          createColumn(12, [
            styledHeading("Aula em vídeo — Vocabulário", 2),
            styledParagraph("Assista ao vídeo e anote as palavras novas na caixa ao lado."),
          ]),
        ],
      },
      {
        ...createSection("Conteúdo", 2),
        layoutDirection: "rows",
        style: { gap: 24, padding: { top: 24, bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(4, [
            {
              ...createComponent("vocabulary-box"),
              props: {
                title: "Palavras do vídeo",
                pairs: [
                  { term: "buongiorno", translation: "bom dia" },
                  { term: "arrivederci", translation: "até logo" },
                  { term: "per favore", translation: "por favor" },
                  { term: "grazie mille", translation: "muito obrigado" },
                ],
                backgroundColor: "#1e40af",
              },
            },
            {
              ...createComponent("icon-badge"),
              props: { icon: "volume-2", label: "Áudio", subtitle: "Repita em voz alta", variant: "info", content: "" },
            },
          ]),
          createColumn(8, [
            createComponent("video"),
            {
              ...createComponent("callout"),
              props: {
                variant: "info",
                title: "Frase-chave",
                text: '"<em>Buongiorno! Come posso aiutarla?</em>" — Bom dia! Como posso ajudá-la?',
              },
              style: { backgroundColor: "#eff6ff", borderRadius: 12, padding: { top: 16, bottom: 16, left: 20, right: 20 } },
            },
            styledParagraph("Pause o vídeo sempre que ouvir uma palavra desconhecida e anote na caixa de vocabulário."),
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-video-compacta",
    name: "Vídeo compacto",
    category: "Vídeo-aula",
    description: "Layout enxuto: vídeo centralizado, notas rápidas e link para material",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Vídeo", 1),
        style: {
          padding: { top: 32, bottom: 32, left: 24, right: 24 },
          maxWidth: "narrow",
          align: "center",
          typography: { textAlign: "center" },
        },
        columns: [
          createColumn(12, [
            styledHeading("Assista e aprenda", 2),
            createComponent("video"),
            styledParagraph("Anote os pontos principais enquanto assiste. Duração estimada: 5–10 minutos."),
            createComponent("separator"),
            {
              ...createComponent("list"),
              props: {
                ordered: false,
                items: [
                  "Preste atenção na pronúncia das vogais",
                  "Repita as frases em voz alta após o professor",
                  "Anote dúvidas para revisar depois",
                ],
              },
            },
            createComponent("file-download"),
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-video-pos-aula",
    name: "Vídeo + exercício pós-aula",
    category: "Vídeo-aula",
    description: "Vídeo principal seguido de atividades para fixar o conteúdo assistido",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Vídeo", 1),
        style: { gap: 20, padding: { top: 24, bottom: 16, left: 16, right: 16 }, backgroundColor: "#f8fafc" },
        columns: [
          createColumn(12, [
            styledHeading("Assista antes de praticar", 2),
            styledParagraph("Veja o vídeo completo antes de responder aos exercícios abaixo."),
            createComponent("video"),
          ]),
        ],
      },
      {
        ...createSection("Prática", 2),
        style: { gap: 20, padding: { top: 16, bottom: 32, left: 16, right: 16 } },
        columns: [
          createColumn(6, [
            styledHeading("Exercício 1", 3),
            {
              ...createComponent("activity"),
              props: {
                title: "Compreensão",
                instructions: "Com base no vídeo, escolha a resposta correta.",
                source: "manual",
                manualType: "multiple_choice",
                manualTitle: "O que foi o tema principal?",
                manualConfig: {
                  question: "Qual tópico foi abordado no vídeo?",
                  options: [
                    { id: "a", text: "Cumprimentos formais" },
                    { id: "b", text: "Verbos irregulares" },
                    { id: "c", text: "Números ordinais" },
                  ],
                  correctOptionId: "a",
                },
              },
            },
          ]),
          createColumn(6, [
            styledHeading("Exercício 2", 3),
            {
              ...createComponent("activity"),
              props: {
                title: "Complete",
                instructions: "Preencha com o que você ouviu no vídeo.",
                source: "manual",
                manualType: "fill_blank",
                manualTitle: "Frase do vídeo",
                manualConfig: {
                  template: "{{blank1}}, come stai?",
                  blanks: [{ id: "blank1", answer: "Ciao", hint: "Cumprimento informal" }],
                },
              },
            },
            {
              ...createComponent("writing-lines"),
              props: { prompt: "Escreva uma frase que você aprendeu no vídeo:", lineCount: 2, showNumbers: false },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-video-transcricao",
    name: "Vídeo com transcrição",
    category: "Vídeo-aula",
    description: "Vídeo, diálogo transcrito e perguntas de compreensão",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Vídeo + texto", 2),
        layoutDirection: "rows",
        style: { gap: 20, padding: { top: 24, bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(7, [
            styledHeading("Aula em vídeo", 2),
            createComponent("video"),
            styledParagraph("Leia a transcrição ao lado enquanto assiste ou depois de terminar o vídeo."),
          ]),
          createColumn(5, [
            styledHeading("Transcrição", 3),
            {
              ...createComponent("dialogue-box"),
              props: {
                context: "Transcrição do diálogo apresentado no vídeo.",
                lines: [
                  { speaker: "Professore", text: "Oggi impariamo i saluti in italiano." },
                  { speaker: "Professore", text: "Buongiorno si usa di mattina. Buonasera di sera." },
                  { speaker: "Professore", text: "Ciao è informale — per amici e famiglia." },
                ],
              },
            },
            {
              ...createComponent("callout"),
              props: {
                variant: "tip",
                title: "Dica",
                text: "Siga a transcrição com o dedo enquanto ouve para treinar listening e leitura ao mesmo tempo.",
              },
            },
          ]),
        ],
      },
      {
        ...createSection("Compreensão", 2),
        style: { gap: 16, padding: { bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(12, [
            styledHeading("Verifique sua compreensão", 3),
            {
              ...createComponent("activity"),
              props: {
                title: "Verdadeiro ou falso",
                instructions: "Com base no vídeo e na transcrição.",
                source: "manual",
                manualType: "true_false",
                manualTitle: "Afirmação",
                manualConfig: {
                  statement: "Ciao é um cumprimento formal usado com desconhecidos.",
                  correct: false,
                },
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-video-partes",
    name: "Vídeo em partes",
    category: "Vídeo-aula",
    description: "Aula dividida em etapas com vídeos sequenciais e resumo entre partes",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Introdução", 1),
        style: {
          padding: { top: 24, bottom: 16, left: 24, right: 24 },
          backgroundColor: "#dbeafe",
          typography: { textAlign: "center" },
        },
        columns: [
          createColumn(12, [
            styledHeading("Aula em 3 partes", 2),
            styledParagraph("Assista cada parte na ordem. Faça uma pausa entre elas para revisar."),
          ]),
        ],
      },
      {
        ...createSection("Parte 1", 1),
        style: { gap: 16, padding: { top: 16, bottom: 16, left: 16, right: 16 } },
        columns: [
          createColumn(12, [
            styledHeading("Parte 1 — Introdução", 3),
            createComponent("video"),
            styledParagraph("Nesta parte você conhece o contexto e o vocabulário básico."),
          ]),
        ],
      },
      {
        ...createSection("Parte 2", 1),
        style: { gap: 16, padding: { top: 8, bottom: 16, left: 16, right: 16 }, backgroundColor: "#f8fafc" },
        columns: [
          createColumn(12, [
            styledHeading("Parte 2 — Exemplos práticos", 3),
            createComponent("video"),
            {
              ...createComponent("example-grid"),
              props: {
                columns: 2,
                items: [
                  { left: "<strong>Buongiorno</strong>", right: "Bom dia" },
                  { left: "<strong>Buonasera</strong>", right: "Boa noite" },
                ],
              },
            },
          ]),
        ],
      },
      {
        ...createSection("Parte 3", 1),
        style: { gap: 16, padding: { top: 8, bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(12, [
            styledHeading("Parte 3 — Revisão e conclusão", 3),
            createComponent("video"),
            {
              ...createComponent("callout"),
              props: {
                variant: "info",
                title: "Resumo da aula",
                text: "Você aprendeu cumprimentos formais e informais em italiano. Pratique em voz alta!",
              },
            },
            createComponent("file-download"),
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-video-legendado",
    name: "Vídeo legendado + notas",
    category: "Vídeo-aula",
    description: "Vídeo com área de anotações, citação destacada e material para download",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Vídeo", 2),
        layoutDirection: "rows",
        style: { gap: 24, padding: { top: 24, bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(8, [
            styledHeading("Assista com atenção às legendas", 2),
            createComponent("video"),
            {
              ...createComponent("quote"),
              props: {
                text: "La pratica rende perfetti.",
                author: "Provérbio italiano — A prática leva à perfeição",
              },
            },
          ]),
          createColumn(4, [
            {
              ...createComponent("icon-badge"),
              props: {
                icon: "volume-2",
                label: "Listening",
                subtitle: "Ative as legendas",
                variant: "info",
                content: "",
              },
            },
            styledHeading("Suas anotações", 3),
            {
              ...createComponent("writing-lines"),
              props: { prompt: "Palavras novas que ouvi:", lineCount: 3, showNumbers: false },
            },
            {
              ...createComponent("writing-lines"),
              props: { prompt: "Dúvidas ou observações:", lineCount: 3, showNumbers: false },
            },
            createComponent("separator"),
            createComponent("file-download"),
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-gramatica",
    name: "Gramática com exemplos",
    category: "Explicação",
    description: "Regra gramatical, tabela de conjugação e grade de exemplos EN/PT",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Gramática", 2),
        style: { gap: 20, padding: { top: 24, bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(3, [
            {
              ...createComponent("icon-badge"),
              props: {
                icon: "alert-triangle",
                label: "Mind the gap",
                subtitle: "",
                variant: "warning",
                content: "Exceções: see → seeing (não seeeing)",
              },
            },
            {
              ...createComponent("vocabulary-box"),
              props: {
                title: "Vocabulário",
                pairs: [
                  { term: "inflexible", translation: "inflexível" },
                  { term: "attractive", translation: "atraente" },
                ],
                backgroundColor: "#6b21a8",
              },
            },
          ]),
          createColumn(9, [
            styledHeading("3.1 Present Continuous — Structure", 2),
            styledParagraph(
              "O <em>Present Continuous</em> é formado com o verbo <strong>to be</strong> + verbo principal com sufixo <strong>-ing</strong>.",
            ),
            {
              ...createComponent("table"),
              props: {
                headers: ["SUBJECT", "VERB TO BE", "MAIN VERB + ING", "COMPLEMENT"],
                rows: [
                  [{ content: "I" }, { content: "<strong>am</strong>" }, { content: "runn<strong>ing</strong>" }, { content: "out of money." }],
                  [{ content: "He" }, { content: "<strong>is</strong>", rowspan: 3 }, { content: "help<strong>ing</strong>" }, { content: "his mother." }],
                  [{ content: "She" }, { content: "work<strong>ing</strong>" }, { content: "hard." }],
                  [{ content: "It" }, { content: "rain<strong>ing</strong>" }, { content: "outside." }],
                ],
              },
            },
            createComponent("spacer"),
            {
              ...createComponent("example-grid"),
              props: {
                columns: 2,
                items: [
                  { left: "I <strong>am running</strong> out of money.", right: "<strong>I'm running</strong> out of money." },
                  { left: "You <strong>are working</strong> hard.", right: "<strong>You're working</strong> hard." },
                  { left: "He <strong>is helping</strong> his mother.", right: "<strong>He's helping</strong> his mother." },
                ],
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-exercicios",
    name: "Página de exercícios",
    category: "Exercícios",
    description: "Duas colunas com atividades, lacunas e linhas para escrever",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Exercícios", 2),
        style: {
          gap: 24,
          padding: { top: 24, bottom: 32, left: 16, right: 16 },
          backgroundColor: "#fafafa",
        },
        columns: [
          createColumn(6, [
            styledHeading("Exercício 2:", 3),
            styledParagraph("Escolha a alternativa correta."),
            {
              ...createComponent("activity"),
              props: {
                title: "Exercício 2",
                instructions: "Marque a opção correta.",
                source: "manual",
                manualType: "multiple_choice",
                manualTitle: "Qual artigo completa a frase?",
                manualConfig: {
                  question: "The young man is wearing ___ red shirt.",
                  options: [
                    { id: "a", text: "a" },
                    { id: "b", text: "an" },
                    { id: "c", text: "the" },
                  ],
                  correctOptionId: "a",
                },
              },
            },
            createComponent("separator"),
            styledHeading("Exercício 3:", 3),
            styledParagraph("Monte frases com as palavras dadas."),
            {
              ...createComponent("writing-lines"),
              props: { prompt: "1. Mary's — hair — blond — shirt — red", lineCount: 2, showNumbers: true },
            },
            {
              ...createComponent("writing-lines"),
              props: { prompt: "2. He — wearing — blue — jeans — today", lineCount: 2, showNumbers: false },
            },
          ]),
          createColumn(6, [
            styledHeading("Exercício 4:", 3),
            styledParagraph("Traduza as frases para o inglês."),
            {
              ...createComponent("writing-lines"),
              props: { prompt: "1. Ele era muito atraente.", lineCount: 2, showNumbers: true },
            },
            {
              ...createComponent("writing-lines"),
              props: { prompt: "2. Ela estava usando uma camisa vermelha.", lineCount: 2, showNumbers: true },
            },
            createComponent("separator"),
            {
              ...createComponent("infobox"),
              props: {
                title: "Infobox",
                sections: [
                  {
                    subtitle: "Pesos e medidas",
                    rows: [
                      { left: "1 pound (£)", right: "0,45 kg" },
                      { left: "1 ounce (oz.)", right: "28,35 g" },
                    ],
                  },
                ],
              },
            },
            createComponent("separator"),
            {
              ...createComponent("activity"),
              props: {
                title: "Exercício 5",
                instructions: "Verdadeiro ou falso.",
                source: "bank",
                exerciseId: "TF-001",
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-vocab-dialogo",
    name: "Vocabulário + diálogo",
    category: "Explicação",
    description: "Caixa de vocabulário, diálogo contextual e exercícios de fixação",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Conteúdo", 2),
        style: { gap: 20, padding: { top: 24, bottom: 24 } },
        columns: [
          createColumn(4, [
            {
              ...createComponent("vocabulary-box"),
              props: {
                title: "Vocabulário",
                pairs: [
                  { term: "blond hair", translation: "cabelo loiro" },
                  { term: "red shirt", translation: "camisa vermelha" },
                  { term: "attractive", translation: "atraente" },
                  { term: "charming", translation: "encantador" },
                ],
                backgroundColor: "#6b21a8",
              },
            },
            {
              ...createComponent("icon-badge"),
              props: { icon: "book-open", label: "Seção B", subtitle: "", variant: "info", content: "" },
            },
          ]),
          createColumn(8, [
            styledHeading("Descrever a si mesmo e aos outros", 2),
            styledParagraph("Ele era muito atraente e usava uma camisa vermelha. Observe o diálogo abaixo:"),
            createComponent("dialogue-box"),
            createComponent("separator"),
            styledHeading("Exercício 1:", 3),
            styledParagraph("Responda com suas próprias palavras."),
            {
              ...createComponent("writing-lines"),
              props: { prompt: "Como você descreveria a aparência de alguém que conhece?", lineCount: 3, showNumbers: false },
            },
            {
              ...createComponent("activity"),
              props: {
                title: "Exercício 2",
                instructions: "Complete as lacunas.",
                source: "manual",
                manualType: "fill_blank",
                manualTitle: "Artigos",
                manualConfig: {
                  template: "The young man is wearing {{blank1}} red shirt.",
                  blanks: [{ id: "blank1", answer: "a", hint: "Artigo indefinido" }],
                },
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-introducao",
    name: "Introdução da aula",
    category: "Introdução",
    description: "Objetivos, tópicos da aula e lista do que o aluno vai aprender",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Cabeçalho", 1),
        style: {
          padding: { top: 32, bottom: 24, left: 24, right: 24 },
          backgroundColor: "#ecfdf5",
          align: "center",
          typography: { textAlign: "center" },
        },
        columns: [
          createColumn(12, [
            styledHeading("Bem-vindo à aula", 2),
            styledParagraph("Nesta aula você vai aprender conceitos essenciais para avançar no seu italiano."),
          ]),
        ],
      },
      {
        ...createSection("Objetivos", 2),
        style: { gap: 20, padding: { top: 24, bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(6, [
            styledHeading("O que você vai aprender", 3),
            {
              ...createComponent("list"),
              props: {
                ordered: true,
                items: [
                  "Cumprimentos formais e informais",
                  "Pronomes pessoais e verbos no presente",
                  "Vocabulário básico do dia a dia",
                ],
              },
            },
            {
              ...createComponent("callout"),
              props: {
                variant: "info",
                title: "Duração estimada",
                text: "Esta aula leva cerca de 20 minutos. Reserve um tempo tranquilo para praticar.",
              },
            },
          ]),
          createColumn(6, [
            {
              ...createComponent("card-grid"),
              props: {
                cards: [
                  { title: "Vocabulário", description: "12 palavras novas" },
                  { title: "Gramática", description: "Verbo <em>essere</em> e <em>avere</em>" },
                  { title: "Prática", description: "3 exercícios interativos" },
                ],
              },
            },
            createComponent("separator"),
            {
              ...createComponent("alert"),
              props: {
                variant: "info",
                title: "Antes de começar",
                text: "Tenha papel e caneta à mão para anotar exemplos e dúvidas.",
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-pronuncia",
    name: "Pronúncia e fonética",
    category: "Pronúncia",
    description: "Áudio de referência, tabela fonética e grade de exemplos IT/PT",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Pronúncia", 2),
        style: { gap: 20, padding: { top: 24, bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(3, [
            {
              ...createComponent("icon-badge"),
              props: {
                icon: "volume-2",
                label: "Áudio",
                subtitle: "Ouça e repita",
                variant: "info",
                content: "",
              },
            },
            {
              ...createComponent("callout"),
              props: {
                variant: "tip",
                title: "Dica de pronúncia",
                text: "Em italiano, a letra <strong>r</strong> é sempre vibrante — pratique com calma.",
              },
            },
          ]),
          createColumn(9, [
            styledHeading("Sons do alfabeto italiano", 2),
            styledParagraph("Observe a pronúncia das vogais e das consoantes mais comuns:"),
            {
              ...createComponent("table"),
              props: {
                headers: ["Letra", "Som", "Exemplo", "Tradução"],
                rows: [
                  [{ content: "<strong>a</strong>" }, { content: "/a/" }, { content: "<em>casa</em>" }, { content: "casa" }],
                  [{ content: "<strong>e</strong>" }, { content: "/e/" }, { content: "<em>verde</em>" }, { content: "verde" }],
                  [{ content: "<strong>i</strong>" }, { content: "/i/" }, { content: "<em>vino</em>" }, { content: "vinho" }],
                  [{ content: "<strong>gn</strong>" }, { content: "/ɲ/" }, { content: "<em>gnocchi</em>" }, { content: "nhoque" }],
                ],
              },
            },
            createComponent("spacer"),
            {
              ...createComponent("example-grid"),
              props: {
                columns: 2,
                items: [
                  { left: "<strong>Buongiorno</strong>", right: "Bom dia" },
                  { left: "<strong>Buonasera</strong>", right: "Boa noite" },
                  { left: "<strong>Arrivederci</strong>", right: "Até logo" },
                ],
              },
            },
            createComponent("separator"),
            styledHeading("Pratique", 3),
            {
              ...createComponent("writing-lines"),
              props: { prompt: "Repita em voz alta e escreva a transcrição: Ciao, come stai?", lineCount: 2, showNumbers: false },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-listening",
    name: "Compreensão oral",
    category: "Listening",
    description: "Áudio incorporado, diálogo contextual e exercício de compreensão",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Listening", 2),
        style: { gap: 20, padding: { top: 24, bottom: 24, left: 16, right: 16 }, backgroundColor: "#f0f9ff" },
        columns: [
          createColumn(12, [
            styledHeading("Compreensão oral — Diálogo no café", 2),
            styledParagraph("Ouça o áudio abaixo e preste atenção nas expressões usadas no dia a dia."),
          ]),
        ],
      },
      {
        ...createSection("Conteúdo", 2),
        style: { gap: 20, padding: { bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(4, [
            {
              ...createComponent("embed"),
              props: { url: "", embedType: "audio", title: "Diálogo no café" },
            },
            {
              ...createComponent("vocabulary-box"),
              props: {
                title: "Palavras-chave",
                pairs: [
                  { term: "un caffè", translation: "um café" },
                  { term: "per favore", translation: "por favor" },
                  { term: "quanto costa?", translation: "quanto custa?" },
                ],
                backgroundColor: "#0369a1",
              },
            },
          ]),
          createColumn(8, [
            {
              ...createComponent("dialogue-box"),
              props: {
                context: "Marco entra num bar em Roma e pede um café.",
                lines: [
                  { speaker: "Marco", text: "Buongiorno! Un caffè, per favore." },
                  { speaker: "Barista", text: "Certo. Vuole anche un cornetto?" },
                  { speaker: "Marco", text: "Sì, grazie. Quanto costa?" },
                  { speaker: "Barista", text: "Tre euro e cinquanta, per favore." },
                ],
              },
            },
            createComponent("separator"),
            styledHeading("Exercício de compreensão", 3),
            {
              ...createComponent("activity"),
              props: {
                title: "Exercício 1",
                instructions: "Responda com base no áudio ouvido.",
                source: "manual",
                manualType: "multiple_choice",
                manualTitle: "O que Marco pede primeiro?",
                manualConfig: {
                  question: "Qual é o primeiro pedido de Marco?",
                  options: [
                    { id: "a", text: "Un cornetto" },
                    { id: "b", text: "Un caffè" },
                    { id: "c", text: "Una birra" },
                  ],
                  correctOptionId: "b",
                },
              },
            },
            {
              ...createComponent("writing-lines"),
              props: { prompt: "Quanto Marco paga no total? Escreva a resposta em italiano.", lineCount: 2, showNumbers: false },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-cultura",
    name: "Cultura e curiosidades",
    category: "Cultura",
    description: "Imagem, citação, cards temáticos e destaque cultural",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Cultura", 2),
        style: { gap: 24, padding: { top: 24, bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(5, [
            {
              ...createComponent("image"),
              props: {
                src: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800",
                alt: "Paisagem italiana",
                caption: "Itália — tradição, história e língua viva",
              },
            },
            {
              ...createComponent("quote"),
              props: {
                text: "Una lingua diversa è una diversa visione della vita.",
                author: "Federico Fellini",
              },
            },
          ]),
          createColumn(7, [
            styledHeading("Curiosidades sobre a Itália", 2),
            styledParagraph("Conhecer a cultura ajuda a fixar o vocabulário e entender o contexto das expressões."),
            {
              ...createComponent("card-grid"),
              props: {
                cards: [
                  { title: "Gastronomia", description: "Cada região tem pratos e nomes únicos" },
                  { title: "Gestos", description: "A comunicação não verbal é parte do idioma" },
                  { title: "Festivais", description: "Carnaval, Ferragosto e festas locais" },
                ],
              },
            },
            createComponent("separator"),
            {
              ...createComponent("callout"),
              props: {
                variant: "info",
                title: "Você sabia?",
                text: "O italiano tem dialetos regionais muito distintos, mas o <em>italiano standard</em> é compreendido em todo o país.",
              },
            },
            {
              ...createComponent("list"),
              props: {
                ordered: false,
                items: [
                  "<strong>La dolce vita</strong> — expressão famosa no cinema italiano",
                  "<strong>Pronto!</strong> — usado ao atender o telefone",
                  "<strong>Salute!</strong> — brinde antes de beber",
                ],
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-revisao-quiz",
    name: "Revisão com quiz",
    category: "Revisão",
    description: "Recapitulação de vocabulário, quiz interativo e FAQ com respostas",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Revisão", 2),
        style: {
          gap: 20,
          padding: { top: 24, bottom: 32, left: 16, right: 16 },
          backgroundColor: "#fefce8",
        },
        columns: [
          createColumn(4, [
            styledHeading("Recapitulando", 3),
            {
              ...createComponent("vocabulary-box"),
              props: {
                title: "Vocabulário da aula",
                pairs: [
                  { term: "ciao", translation: "olá / tchau" },
                  { term: "grazie", translation: "obrigado" },
                  { term: "prego", translation: "de nada" },
                  { term: "scusi", translation: "com licença" },
                ],
                backgroundColor: "#854d0e",
              },
            },
            {
              ...createComponent("infobox"),
              props: {
                title: "Referência rápida",
                sections: [
                  {
                    subtitle: "Verbo <em>essere</em>",
                    rows: [
                      { left: "io sono", right: "eu sou" },
                      { left: "tu sei", right: "tu és" },
                      { left: "lui/lei è", right: "ele/ela é" },
                    ],
                  },
                ],
              },
            },
          ]),
          createColumn(8, [
            styledHeading("Quiz de revisão", 2),
            styledParagraph("Teste o que você aprendeu nesta aula:"),
            {
              ...createComponent("activity"),
              props: {
                title: "Questão 1",
                instructions: "Escolha a tradução correta.",
                source: "manual",
                manualType: "multiple_choice",
                manualTitle: "Tradução",
                manualConfig: {
                  question: 'Como se diz "obrigado" em italiano?',
                  options: [
                    { id: "a", text: "Prego" },
                    { id: "b", text: "Grazie" },
                    { id: "c", text: "Scusi" },
                  ],
                  correctOptionId: "b",
                },
              },
            },
            {
              ...createComponent("activity"),
              props: {
                title: "Questão 2",
                instructions: "Complete a lacuna.",
                source: "manual",
                manualType: "fill_blank",
                manualTitle: "Conjugação",
                manualConfig: {
                  template: "Io {{blank1}} italiano. (essere)",
                  blanks: [{ id: "blank1", answer: "sono", hint: "1ª pessoa do singular" }],
                },
              },
            },
            createComponent("separator"),
            {
              ...createComponent("accordion"),
              props: {
                items: [
                  { title: "Qual a diferença entre <em>ciao</em> e <em>buongiorno</em>?", content: "<em>Ciao</em> é informal; <em>buongiorno</em> é formal e usado de manhã." },
                  { title: "Quando usar <em>prego</em>?", content: "Significa \"de nada\" após alguém agradecer, ou \"por favor\" ao oferecer algo." },
                  { title: "Como continuar praticando?", content: "Revise o vocabulário diariamente e tente formar frases simples em voz alta." },
                ],
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-resumo-cta",
    name: "Resumo e próximos passos",
    category: "Revisão",
    description: "Síntese da aula, material para download e chamada para a próxima etapa",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Resumo", 1),
        style: {
          padding: { top: 32, bottom: 24, left: 24, right: 24 },
          backgroundColor: "#f5f3ff",
          align: "center",
          typography: { textAlign: "center" },
        },
        columns: [
          createColumn(12, [
            styledHeading("Parabéns! Você concluiu esta aula", 2),
            styledParagraph("Revise os pontos principais abaixo e avance para a próxima etapa do curso."),
          ]),
        ],
      },
      {
        ...createSection("Conteúdo", 2),
        style: { gap: 20, padding: { top: 16, bottom: 32, left: 16, right: 16 } },
        columns: [
          createColumn(6, [
            styledHeading("O que você aprendeu", 3),
            {
              ...createComponent("list"),
              props: {
                ordered: false,
                items: [
                  "Cumprimentos básicos em italiano",
                  "Verbos <em>essere</em> e <em>avere</em> no presente",
                  "Expressões do cotidiano em contexto",
                ],
              },
            },
            createComponent("separator"),
            createComponent("file-download"),
            {
              ...createComponent("callout"),
              props: {
                variant: "tip",
                title: "Dica de estudo",
                text: "Repita os diálogos em voz alta pelo menos 3 vezes antes de avançar.",
              },
            },
          ]),
          createColumn(6, [
            {
              ...createComponent("cta"),
              props: {
                title: "Pronto para a próxima aula?",
                description: "Continue praticando com exercícios interativos e conteúdo exclusivo.",
                buttonLabel: "Ir para a próxima aula",
                buttonUrl: "#",
              },
            },
            createComponent("spacer"),
            {
              ...createComponent("activity"),
              props: {
                title: "Desafio final",
                instructions: "Escreva uma frase de apresentação em italiano.",
                source: "manual",
                manualType: "fill_blank",
                manualTitle: "Autoavaliação",
                manualConfig: {
                  template: "Mi chiamo {{blank1}} e vengo dal {{blank2}}.",
                  blanks: [
                    { id: "blank1", answer: "", hint: "Seu nome" },
                    { id: "blank2", answer: "", hint: "Seu país" },
                  ],
                },
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-leitura",
    name: "Leitura guiada",
    category: "Explicação",
    description: "Texto com vocabulário lateral, perguntas de interpretação e citação",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Leitura", 2),
        style: { gap: 20, padding: { top: 24, bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(3, [
            {
              ...createComponent("vocabulary-box"),
              props: {
                title: "Palavras do texto",
                pairs: [
                  { term: "la piazza", translation: "a praça" },
                  { term: "il mercato", translation: "o mercado" },
                  { term: "ogni giorno", translation: "todos os dias" },
                  { term: "i vicini", translation: "os vizinhos" },
                ],
                backgroundColor: "#6b21a8",
              },
            },
            {
              ...createComponent("icon-badge"),
              props: { icon: "book-open", label: "Leitura", subtitle: "Nível A1", variant: "info", content: "" },
            },
          ]),
          createColumn(9, [
            styledHeading("Una mattina a Firenze", 2),
            styledParagraph(
              "Ogni mattina, <strong>Giulia</strong> va al mercato nella piazza del Duomo. Compra frutta fresca e pane caldo. I vicini la salutano: <em>\"Buongiorno, Giulia!\"</em> Lei risponde sempre con un sorriso.",
            ),
            styledParagraph(
              "Dopo il mercato, Giulia beve un caffè al bar preferito. A Firenze, il caffè è un rito quotidiano — un momento per rilassarsi e chiacchierare con gli amici.",
            ),
            {
              ...createComponent("quote"),
              props: {
                text: "Il mercato è il cuore della città.",
                author: "Tradição florentina",
              },
            },
            createComponent("separator"),
            styledHeading("Interpretação", 3),
            {
              ...createComponent("writing-lines"),
              props: { prompt: "1. Dove va Giulia ogni mattina?", lineCount: 2, showNumbers: true },
            },
            {
              ...createComponent("writing-lines"),
              props: { prompt: "2. Cosa fa dopo il mercato?", lineCount: 2, showNumbers: true },
            },
            {
              ...createComponent("activity"),
              props: {
                title: "Exercício",
                instructions: "Verdadeiro ou falso com base no texto.",
                source: "manual",
                manualType: "true_false",
                manualTitle: "Compreensão de texto",
                manualConfig: {
                  statement: "Giulia va al mercato ogni sera.",
                  correct: false,
                },
              },
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "layout-conversacao",
    name: "Prática de conversação",
    category: "Exercícios",
    description: "Roteiro de diálogo, frases úteis e exercícios de produção oral",
    createdAt: new Date().toISOString(),
    sections: [
      {
        ...createSection("Conversação", 2),
        style: { gap: 20, padding: { top: 24, bottom: 32, left: 16, right: 16 }, backgroundColor: "#fdf2f8" },
        columns: [
          createColumn(12, [
            styledHeading("Pratique conversação — Apresentações", 2),
            styledParagraph("Use o roteiro abaixo para simular uma conversa. Pratique em voz alta com um colega ou grave-se."),
          ]),
        ],
      },
      {
        ...createSection("Roteiro", 2),
        style: { gap: 20, padding: { bottom: 24, left: 16, right: 16 } },
        columns: [
          createColumn(5, [
            {
              ...createComponent("example-grid"),
              props: {
                columns: 1,
                items: [
                  { left: "<strong>Come ti chiami?</strong>", right: "Qual é o seu nome?" },
                  { left: "<strong>Di dove sei?</strong>", right: "De onde você é?" },
                  { left: "<strong>Piacere di conoscerti!</strong>", right: "Prazer em conhecê-lo!" },
                  { left: "<strong>Quanti anni hai?</strong>", right: "Quantos anos você tem?" },
                ],
              },
            },
            {
              ...createComponent("callout"),
              props: {
                variant: "warning",
                title: "Atenção",
                text: "Use <em>Lei</em> (formal) com desconhecidos e <em>tu</em> (informal) com amigos.",
              },
            },
          ]),
          createColumn(7, [
            {
              ...createComponent("dialogue-box"),
              props: {
                context: "Dois colegas se encontram pela primeira vez na aula de italiano.",
                lines: [
                  { speaker: "Luca", text: "Ciao! Come ti chiami?" },
                  { speaker: "Ana", text: "Mi chiamo Ana. E tu?" },
                  { speaker: "Luca", text: "Io mi chiamo Luca. Di dove sei?" },
                  { speaker: "Ana", text: "Sono brasiliana. Piacere di conoscerti!" },
                  { speaker: "Luca", text: "Piacere mio! Benvenuta al corso." },
                ],
              },
            },
            createComponent("separator"),
            styledHeading("Sua vez!", 3),
            {
              ...createComponent("writing-lines"),
              props: { prompt: "Escreva seu diálogo de apresentação (mínimo 4 falas):", lineCount: 4, showNumbers: false },
            },
            {
              ...createComponent("activity"),
              props: {
                title: "Autoavaliação",
                instructions: "Marque o que você conseguiu fazer.",
                source: "manual",
                manualType: "multiple_choice",
                manualTitle: "Checklist",
                manualConfig: {
                  question: "Conseguiu se apresentar sem ler o roteiro?",
                  options: [
                    { id: "a", text: "Sim, com fluência" },
                    { id: "b", text: "Sim, com hesitação" },
                    { id: "c", text: "Ainda preciso praticar" },
                  ],
                  correctOptionId: "a",
                },
              },
            },
          ]),
        ],
      },
    ],
  },
];

export function getLayoutsByCategory(): Record<string, SavedLayout[]> {
  return LAYOUT_TEMPLATES.reduce<Record<string, SavedLayout[]>>((acc, layout) => {
    if (!acc[layout.category]) acc[layout.category] = [];
    acc[layout.category].push(layout);
    return acc;
  }, {});
}

export function cloneLayoutSections(layout: SavedLayout): PageSection[] {
  return layout.sections.map((s) => {
    const cloned = cloneSection(s);
    cloned.id = pbId("sec");
    cloned.columns = cloned.columns.map((col) => {
      const normalized = normalizeColumn(col);
      return {
        ...normalized,
        id: pbId("col"),
        rows: normalized.rows.map((row) => ({
          ...row,
          id: pbId("row"),
          components: row.components.map((c) => ({ ...c, id: pbId("cmp") })),
        })),
      };
    });
    return cloned;
  });
}
