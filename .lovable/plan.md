## AISEC — Monitoramento Inteligente de EPI

Plataforma web (demo) para monitorar uso de Equipamentos de Proteção Individual em setores industriais, com simulação em tempo real, mapa de calor e alertas de infração.

### Identidade visual
- **Marca**: AISEC, com logo hexagonal verde (uso da imagem enviada).
- **Paleta**: verde escuro institucional (#1f5d4c / similar ao logo), fundo escuro grafite para sensação de "central de controle", acentos amarelo→laranja→vermelho para o gradiente de risco.
- **Tipografia**: sans-serif técnica/moderna (heading mais geométrico, corpo legível).
- **Tom**: industrial, sério, tipo painel de operações.

### Estrutura de rotas
```text
/login           → Tela de login (demo, qualquer credencial entra)
/dashboard       → Métricas e KPIs
/monitoramento   → Cards + planta baixa com mapa de calor
/setores/:id     → Detalhe do setor (histórico de eventos)
```
Rotas pós-login protegidas por guard simples (estado em memória/localStorage).

### 1. Tela de login
- Card centralizado, fundo escuro com logo AISEC.
- Campos email + senha, botão "Entrar" (qualquer valor autentica — demo).
- Link "Esqueci minha senha" (visual).

### 2. Dashboard
KPIs principais em cards no topo:
- Acidentes evitados (mês / total)
- Conformidade média de EPI (%)
- Infrações nas últimas 24h
- Setores em alerta agora

Componentes adicionais:
- Gráfico de linha: acidentes evitados por semana.
- Gráfico de barras: infrações por setor.
- Lista das últimas 5 ocorrências com timestamp e setor.

### 3. Monitoramento (tela principal)
Layout em duas visões com toggle (Cards | Planta baixa):

**Visão Cards** — grid responsivo, cada setor é um card mostrando:
- Nome do setor, nº de pessoas, tempo desde última remoção de EPI.
- Cor do card transiciona de verde → amarelo → laranja → vermelho conforme tempo sem EPI cresce em direção a 60s.
- Barra de progresso indicando segundos até alerta crítico.

**Visão Planta baixa** — SVG esquemático de uma fábrica com zonas (setores) coloridas dinamicamente seguindo o mesmo gradiente de calor. Hover mostra tooltip com info do setor; clique abre detalhe.

**Regra de alerta (60s)**: quando um setor atinge vermelho, abre automaticamente um **modal de infração crítica** com:
- Nome do setor + ícone de alerta piscante.
- Coordenada/posição na planta (ex.: "Linha de Montagem A – Estação 3").
- Funcionário (ID simulado), EPI removido (capacete, luva, óculos…), tempo em infração.
- Botões: "Acionar supervisor", "Marcar como resolvido", "Ignorar".

### 4. Simulação em tempo real
- Setores pré-cadastrados (mock: Solda, Pintura, Montagem A, Montagem B, Estoque, Caldeira, Embalagem, Expedição).
- Hook `useSimulation` roda em intervalo (~1s) atualizando estado de cada setor: probabilidade aleatória de iniciar uma "remoção de EPI", contador crescente até 60s, reset ao ser resolvido.
- Eventos alimentam tanto cards quanto planta e geram histórico para o dashboard.

### Detalhes técnicos
- TanStack Start com rotas em `src/routes/` (login, dashboard, monitoramento, setores.$id).
- Guard de auth via layout route `_authenticated` lendo flag em `localStorage`.
- Estado global da simulação em React context (`SimulationProvider`) para compartilhar entre dashboard e monitoramento.
- Mapa de calor: função utilitária `riskColor(seconds, threshold=60)` interpola HSL verde→vermelho; aplicada via `style` inline ou variáveis CSS nos cards e nos paths SVG da planta.
- Modal usando shadcn `Dialog`; toasts com `sonner` para alertas secundários.
- Logo AISEC copiado para `src/assets/aisec-logo.png` e usado no header e login.

### Fora do escopo (deixar claro)
- Sem backend real, sem persistência entre sessões.
- Sem integração com câmeras/visão computacional — pronto para plugar API depois.
- Sem gestão de usuários/permissões reais.
