# PROCEDA Playground

Playground interativo para explorar, ler e gerar arquivos EDI no padrão PROCEDA.

O projeto é composto por uma API em Symfony e uma interface web em React.

## Funcionalidades

- Exploração visual dos layouts PROCEDA
- Visualização de schemas, registros, campos e relacionamentos
- Leitura de arquivos PROCEDA
- Geração de arquivos PROCEDA
- Validação durante a geração

## Fluxo

### Reader

Converte um arquivo PROCEDA em sua representação JSON.

```text
TXT → Base64 → POST /api/read/{type}/{version} → JSON
```

### Writer

Converte uma representação JSON em um arquivo PROCEDA.

```text
JSON → POST /api/write/{type}/{version} → Base64 → TXT
```

O Base64 é utilizado no transporte para preservar o conteúdo original do arquivo, incluindo charset e quebras de linha.

## API

### Read

```http
POST /api/read/{type}/{version}
Content-Type: text/plain
```

O corpo da requisição contém o arquivo PROCEDA codificado em Base64.

Exemplo:

```text
POST /api/read/notfis/v31
```

Resposta:

```json
{
  "...": "..."
}
```

### Write

```http
POST /api/write/{type}/{version}
Content-Type: application/json
```

O corpo contém a representação JSON do intercâmbio.

Exemplo:

```text
POST /api/write/notfis/v31
```

Resposta:

```json
{
  "validation": [],
  "content": "..."
}
```

`content` contém o arquivo PROCEDA resultante codificado em Base64.

## Arquitetura

```text
React
  │
  ▼
Symfony API
  │
  ├── PROCEDA Reader
  │
  └── PROCEDA Writer
```

O Reader e os modelos utilizados pelo Playground fazem parte do projeto open source PROCEDA.

O PROCEDA Writer é um componente comercial distribuído separadamente e não faz parte deste repositório.

Durante o build do ambiente autorizado, o artefato `writer.prcd` é obtido separadamente e executado pelo PROCEDA Runtime.

## Desenvolvimento

O projeto contém:

```text
.
├── front/          # React + Vite
├── src/            # Symfony API
├── config/
├── public/
├── Dockerfile
├── docker-compose.yaml
└── Makefile
```

O artefato `writer.prcd` não é distribuído neste repositório.

> **Nota:** o ambiente completo de desenvolvimento do Writer requer acesso autorizado ao artefato comercial `writer.prcd`. O código-fonte deste Playground não inclui nem distribui esse artefato.
