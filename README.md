# AFT Planner — código-fonte completo

## O que tem aqui

```
aft-planner/
├── index.html          # página HTML base
├── package.json        # dependências (React + Vite)
├── vite.config.js       # configuração de build
├── netlify.toml         # configuração de deploy no Netlify
└── src/
    ├── main.jsx          # ponto de entrada — monta o React na página
    ├── AFTPlanner.jsx    # o componente inteiro (toda a lógica e visual do painel)
    └── storage-shim.js   # substitui window.storage (exclusivo do Claude) por localStorage
```

## Linguagens usadas

- **JavaScript com JSX** (React) — todo o `AFTPlanner.jsx`, `main.jsx`
- **CSS puro** — embutido dentro do próprio `AFTPlanner.jsx`, na constante `CSS`
- **HTML** — só o `index.html`, mínimo, o React monta tudo dentro de `<div id="root">`

Não tem backend, banco de dados ou servidor próprio — roda inteiramente no navegador
de quem abrir a página.

## Como rodar no seu computador (opcional, para testar antes de publicar)

Precisa ter o [Node.js](https://nodejs.org) instalado. Depois:

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Como publicar

### Opção 1 — Arrastar e soltar (mais rápido, sem conta Git)
```bash
npm install
npm run build
```
Isso cria uma pasta `dist/`. Vá em [app.netlify.com/drop](https://app.netlify.com/drop)
e arraste a pasta `dist/` inteira para lá. O Netlify te dá uma URL pública na hora.

### Opção 2 — Conectar um repositório Git (mantém atualizado sozinho)
1. Suba esta pasta inteira para um repositório no GitHub/GitLab/Bitbucket.
2. No Netlify: "Add new site" → "Import an existing project" → conecte o repositório.
3. O Netlify já detecta o `netlify.toml` com o comando de build (`npm run build`)
   e a pasta de publicação (`dist`) automaticamente. Clique em "Deploy".

Depois disso, toda vez que você atualizar `src/AFTPlanner.jsx` e enviar (`git push`),
o Netlify republica o site sozinho.

## Importante sobre os dados salvos

Os projetos de família ficam salvos no `localStorage` do navegador de quem
estiver usando o site publicado — **separado** dos projetos que você já tem
salvos aqui dentro do Claude. Um projeto criado no Netlify não aparece
automaticamente no Claude, e vice-versa. Também é por navegador/dispositivo:
abrir no celular e no computador dá duas listas diferentes.
