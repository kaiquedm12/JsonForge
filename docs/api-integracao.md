# JsonForge — API de Visualização

## Visão Geral

API REST que recebe um JSON e retorna os mesmos gráficos, estatísticas e schemas gerados pelo JsonForge.

**URL base (desenvolvimento):** `http://localhost:3000`
**URL base (produção):** `https://json-forge-eight.vercel.app`

---

## Autenticação

Todos os requests devem incluir um token de acesso.

**Via header Authorization:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

**Via query string (alternativa):**
```
?token=SEU_TOKEN_AQUI
```

Se o token não for informado ou for inválido, a API retorna `401 Unauthorized`.

---

## Endpoint

### `POST /api/visualize`

Gera o grafo interativo, estatísticas e schemas a partir de um JSON.

#### Request

**Content-Type:** `application/json`

Três formatos aceitos:

**Formato 1 — JSON string:**
```json
"{ \"nome\": \"João\", \"idade\": 30 }"
```

**Formato 2 — Objeto com campo `json`:**
```json
{
  "json": "{ \"nome\": \"João\", \"idade\": 30 }"
}
```

**Formato 3 — Raw JSON (recomendado):**
```json
{
  "nome": "João",
  "idade": 30,
  "endereco": {
    "cidade": "São Paulo",
    "uf": "SP"
  },
  "telefones": ["11999999999", "11888888888"]
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "card-node-1",
        "type": "cardNode",
        "position": { "x": 120, "y": 50 },
        "data": {
          "id": "card-node-1",
          "key": "root",
          "path": "$",
          "type": "object",
          "fields": [],
          "childRefs": [
            {
              "key": "endereco",
              "type": "object",
              "childId": "card-node-2",
              "childrenCount": 2,
              "path": "$.endereco",
              "isCollapsed": false
            }
          ],
          "depth": 0,
          "childrenCount": 3,
          "isCollapsed": false,
          "width": 312,
          "height": 107
        }
      }
    ],
    "edges": [
      {
        "id": "e-card-node-1-card-node-2",
        "source": "card-node-1",
        "target": "card-node-2",
        "type": "default"
      }
    ],
    "stats": {
      "totalObjects": 2,
      "totalArrays": 1,
      "totalProperties": 5,
      "maxDepth": 3,
      "fileSize": 123,
      "complexity": 26,
      "totalStrings": 3,
      "totalNumbers": 1,
      "totalBooleans": 0,
      "totalNulls": 1,
      "uniqueKeys": 6
    },
    "schema": {
      "jsonSchema": "{ ... }",
      "typescript": "export interface Root { ... }",
      "zod": "import { z } from 'zod' ...",
      "prisma": "model Root { ... }"
    }
  }
}
```

#### Response (400 — JSON inválido)

```json
{
  "success": false,
  "error": "Mensagem descritiva do erro"
}
```

#### Response (401 — Não autorizado)

```json
{
  "success": false,
  "error": "Não autorizado. Forneça o token via header Authorization: Bearer <token> ou query ?token=<token>"
}
```

---

## Campos do Response

### `nodes`

Array de objetos representando cada card do grafo (objetos e arrays do JSON original).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador único do nó |
| `type` | string | Sempre `"cardNode"` |
| `position` | object | Posição calculada pelo layout automático (dagre) |
| `position.x` | number | Coordenada X |
| `position.y` | number | Coordenada Y |
| `data` | object | Dados completos do card |
| `data.key` | string | Nome da chave (ex: `"root"`, `"endereco"`, `"[0]"`) |
| `data.path` | string | Caminho no JSON (`$`, `$.endereco`, `$.telefones[0]`) |
| `data.type` | string | `"object"` ou `"array"` |
| `data.fields` | array | Valores primitivos exibidos dentro do card |
| `data.childRefs` | array | Referências para cards filhos |
| `data.depth` | number | Profundidade no JSON |
| `data.childrenCount` | number | Total de filhos diretos |
| `data.width` | number | Largura estimada do card em px |
| `data.height` | number | Altura estimada do card em px |

### `edges`

Array de arestas conectando os cards (pai → filho).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | `"e-{source}-{target}"` |
| `source` | string | ID do nó pai |
| `target` | string | ID do nó filho |
| `type` | string | Sempre `"default"` |

### `stats`

| Campo | Tipo | Descrição |
|---|---|---|
| `totalObjects` | number | Total de objetos |
| `totalArrays` | number | Total de arrays |
| `totalProperties` | number | Total de propriedades |
| `maxDepth` | number | Profundidade máxima do JSON |
| `fileSize` | number | Tamanho do JSON em bytes |
| `complexity` | number | Pontuação de complexidade |
| `totalStrings` | number | Total de strings |
| `totalNumbers` | number | Total de números |
| `totalBooleans` | number | Total de booleanos |
| `totalNulls` | number | Total de nulls |
| `uniqueKeys` | number | Quantidade de chaves únicas |

### `schema`

| Campo | Tipo | Descrição |
|---|---|---|
| `jsonSchema` | string | JSON Schema (draft-07) |
| `typescript` | string | Interface TypeScript |
| `zod` | string | Schema de validação Zod |
| `prisma` | string | Model Prisma |

---

## Exemplo com cURL

```bash
curl -X POST http://localhost:3000/api/visualize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"nome": "João", "idade": 30}'
```

---

## Deploy na Vercel

1. Conecte o repositório na Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione a variável:
   - **Name:** `API_TOKEN`
   - **Value:** *token gerado*
4. Faça o deploy

A API estará disponível em `https://{seu-projeto}.vercel.app/api/visualize`.

> Altere o token antes do deploy em produção! Gere um novo com:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
