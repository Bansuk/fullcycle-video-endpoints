# fullcycle-video-use-cases

Backend de uma aplicação de catálogo de vídeos construída com os princípios de **Domain-Driven Design (DDD)**, utilizando **TypeScript** e **Node.js**.

## Arquitetura

O projeto segue uma estrutura em camadas DDD:

```
src/
├── category/
│   ├── domain/
│   │   ├── category.entity.ts             # Aggregate root de Category
│   │   ├── category.validator.ts          # Regras de validação com class-validator
│   │   ├── category.repository.ts         # Interface ICategoryRepository
│   │   └── __tests__/
│   │       └── category.entity.spec.ts
│   ├── application/
│   │   ├── category-output.ts             # DTO de saída e CategoryOutputMapper
│   │   └── use-cases/
│   │       ├── create-category/
│   │       ├── update-category/
│   │       ├── delete-category/
│   │       ├── get-category/
│   │       └── search-categories/
│   └── infra/
│       └── db/
│           └── in-memory/
│               ├── category-in-memory.repository.ts  # Repositório em memória
│               └── __tests__/
└── shared/
    └── domain/
        ├── entity.ts                      # Entidade base abstrata (UUID, props imutáveis)
        ├── value-object.ts                # Value object com igualdade estrutural
        ├── errors/
        │   └── validation.error.ts        # EntityValidationError
        ├── validators/
        │   ├── validator-interface.ts     # IValidatorFields<T>
        │   └── class-validator-fields.ts  # ClassValidatorFields<T>
        └── repository/
            ├── repository-interface.ts    # IRepository, ISearchableRepository, SearchParams, SearchResult
            └── in-memory.repository.ts    # InMemoryRepository, InMemorySearchableRepository
```

### Conceitos de Domínio

- **Entity** — classe base com `id` UUID gerado automaticamente e `props` imutáveis.
- **ValueObject** — classe base com props congeladas e igualdade estrutural via `JSON.stringify`.
- **Category** — aggregate root com `name`, `description`, `is_active` e `created_at`. Suporta as mutações `changeName`, `changeDescription`, `activate` e `deactivate`.

### Casos de Uso (Application Layer)

| Use Case | Descrição |
|---|---|
| `CreateCategoryUseCase` | Cria uma nova categoria |
| `UpdateCategoryUseCase` | Atualiza nome, descrição ou status de uma categoria existente |
| `DeleteCategoryUseCase` | Remove uma categoria pelo `id` |
| `GetCategoryUseCase` | Recupera uma categoria pelo `id` |
| `SearchCategoriesUseCase` | Lista categorias com filtro, ordenação e paginação |

Todos os use cases recebem um DTO de entrada tipado e retornam um `CategoryOutput`:

```typescript
type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};
```

### Validação

A validação da entidade `Category` utiliza `class-validator`. As regras aplicadas ao campo `name` são:

- Não pode ser vazio (`@IsNotEmpty`)
- Não pode conter apenas espaços em branco (`@Matches(/\S+/)`)
- Máximo de 255 caracteres (`@MaxLength(255)`)

Quando a validação falha, um `EntityValidationError` é lançado com os erros organizados por campo.

### Repositório

- **`InMemoryRepository`** — operações básicas de CRUD (`insert`, `findById`, `findAll`, `update`, `delete`).
- **`InMemorySearchableRepository`** — estende o anterior adicionando `search` com suporte a filtro, ordenação e paginação.

O `CategoryInMemoryRepository` implementa:

| Comportamento | Detalhe |
|---|---|
| Filtro por nome | Substring case-insensitive |
| Ordenação padrão | `created_at` decrescente quando `sort` não é informado |
| Paginação | `page`, `per_page` (padrão: 15), `last_page` calculado automaticamente |

## Requisitos

- Node.js 20+
- npm

## Como Começar

### Local (sem Docker)

```bash
npm install
npm run start:dev
```

### Docker (desenvolvimento)

```bash
docker compose up
```

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm test` | Executa todos os testes com cobertura de código |
| `npm run test:watch` | Executa os testes em modo watch |
| `npm run tsc:check` | Verifica tipagem TypeScript sem gerar build |
| `npm run build` | Compila o TypeScript para `dist/` |
| `npm run start:dev` | Inicia o servidor de desenvolvimento com hot-reload |

## Qualidade de Código

- **Cobertura mínima:** 80% (branches, functions, lines e statements) — o Jest falha caso não seja atingida
- **Tipagem:** `npm run tsc:check` valida o projeto sem erros no modo strict

## Docker

O `Dockerfile` utiliza multi-stage builds:

| Stage | Finalidade |
|---|---|
| `base` | Node 20 Alpine com dependências instaladas |
| `development` | Monta o código-fonte, executa via nodemon + ts-node |
| `build` | Compila o TypeScript |
| `production` | Imagem mínima apenas com o output compilado |

## Tecnologias

- **TypeScript 5** — modo strict, target ES2020
- **class-validator** — validação declarativa com decorators
- **reflect-metadata** — suporte a metadados para decorators
- **Jest + ts-jest** — testes unitários com cobertura de código
- **nodemon + ts-node** — hot-reload em desenvolvimento
- **Docker** — ambientes de desenvolvimento e produção em contêiner
# fullcycle-video-endpoints
