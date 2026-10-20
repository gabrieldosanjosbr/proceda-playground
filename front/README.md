# PROCEDA Playground

React + Vite + TypeScript, Tailwind CSS e CodeMirror.

## Docker

```bash
docker compose up --build
```

Abra http://localhost:5173. A imagem usa Node 24 Alpine com pnpm instalado. O código fica montado em `/app`, com volumes separados para dependências e cache. O comando de entrada sincroniza as dependências quando o lockfile muda. Esse container roda o servidor de desenvolvimento; não é uma configuração de produção.

## Sem Docker

```bash
npm install -g pnpm@10.30.3
pnpm install --frozen-lockfile
pnpm dev
```

```bash
pnpm build
pnpm preview
```

## Backend

Copie `.env.example` para `.env` e configure `VITE_API_URL`. Reinicie o Vite após alterar variáveis. As variáveis `VITE_*` são públicas: não coloque chaves privadas nelas.

Sem URL, o front demonstra apenas a fixture visual NOTFIS 3.1. **A fixture não é um arquivo homologado e não implementa parsing nem escrita PROCEDA.** Os outros layouts ficam disponíveis para integração com o backend. CONEMB oferece apenas 3.1.

O serviço `src/services/proceda.ts` faz `POST /reader` ou `POST /writer`, relativos a `VITE_API_URL`, com:

```json
{
  "layout": "NOTFIS",
  "version": "3.1",
  "content": "conteúdo TXT ou JSON"
}
```

Resposta esperada:

```json
{
  "content": "JSON serializado no reader; TXT no writer",
  "issues": [
    {
      "type": "MISSING_REQUIRED_FIELD",
      "registro": "313",
      "campo": "numero",
      "linha": 5,
      "mensagem": "Campo obrigatório não informado."
    }
  ]
}
```

Adapte o serviço ao contrato real da sua API. O Reader deve devolver JSON válido em `content`; a conversão para YAML ocorre no front. Configure CORS no backend quando usar outra origem. A URL deve ser acessível pelo navegador, não apenas pela rede interna do Docker.

## Componentes e personalização

- `Header`, `Hero`, `Footer`: apresentação e links.
- `Playground`: estado e chamada ao serviço.
- `ModeTabs`, `Toolbar`, `EditorPanel`, `IssuesTable`: componentes usados pelo playground.
- `hooks/useTheme.ts`: tema claro/escuro persistido, inicialmente seguindo o sistema.
- `styles.css`: Tailwind com variáveis CSS e estilos da referência; sem estilos inline.
- `public/logo.svg`: aproximação vetorial do símbolo. Substitua pelo logo original; o fundo claro do ícone no tema escuro é provisório.
- `config.ts`: ajuste o GitHub e links de documentação/issues (os padrões apontam ao perfil).

O visualizador JSON usa `@uiw/react-codemirror` + `@codemirror/lang-json`, com destaque de sintaxe, números de linha e folding. Não foi adicionado um editor pesado como Monaco. O resultado é somente leitura, com download JSON/YAML/TXT e copiar via Clipboard API (localhost ou HTTPS).
