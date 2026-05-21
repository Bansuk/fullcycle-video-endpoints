# fullcycle-video-endpoints

Backend de um catálogo de vídeos construído com **Domain-Driven Design (DDD)**, expondo uma API REST com **Express** em **TypeScript**.

## Arquitetura

O projeto segue a estrutura em camadas DDD — Domain → Application → Infrastructure — com uma camada de API HTTP na infraestrutura:

```
src/
├── app.ts                                 # Factory do app Express
├── index.ts                               # Entry point do servidor
├── category/
│   ├── domain/
│   │   ├── category.entity.ts             # Aggregate root de Category
│   │   ├── category.validator.ts          # Regras de validação com class-validator
│   │   ├── category.repository.ts         # Interface ICategoryRepository
│   │   └── __tests__/
│   ├── application/
│   │   ├── category-output.ts             # DTO de saída e CategoryOutputMapper
│   │   └── use-cases/
│   │       ├── create-category/
│   │       ├── update-category/
│   │       ├── delete-category/
│   │       ├── get-category/
│   │       └── search-categories/
│   └── infra/
│       ├── api/
│       │   ├── category.route.ts          # Router Express com os 5 endpoints
│       │   └── __tests__/
│       │       └── category.routes.e2e-spec.ts
│       └── db/
│           └── in-memory/
│               ├── category-in-memory.repository.ts
│               └── __tests__/
├── cast-member/
│   ├── domain/
│   │   ├── cast-member.entity.ts          # Aggregate root de CastMember
│   │   ├── cast-member.validator.ts       # Regras de validação com class-validator
│   │   ├── cast-member.repository.ts      # Interface ICastMemberRepository e CastMemberFilter
│   │   └── __tests__/
│   ├── application/
│   │   ├── cast-member-output.ts          # DTO de saída e CastMemberOutputMapper
│   │   └── use-cases/
│   │       ├── create-cast-member/
│   │       ├── update-cast-member/
│   │       ├── delete-cast-member/
│   │       ├── get-cast-member/
│   │       └── search-cast-members/
│   └── infra/
│       ├── api/
│       │   ├── cast-member.route.ts       # Router Express com os 5 endpoints
│       │   └── __tests__/
│       │       └── cast-member.routes.e2e-spec.ts
│       └── db/
│           └── in-memory/
│               ├── cast-member-in-memory.repository.ts
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
- **CastMember** — aggregate root com `name`, `type` e `created_at`. Suporta as mutações `changeName` e `changeType`.

---

## API REST

O servidor sobe na porta `3000` por padrão (configurável via variável `PORT`).

### Categorias — `/categories`

| Método   | Rota              | Descrição                                   | Status de sucesso |
| -------- | ----------------- | ------------------------------------------- | ----------------- |
| `POST`   | `/categories`     | Cria uma nova categoria                     | `201`             |
| `GET`    | `/categories`     | Lista categorias (filtro, ordenação, página) | `200`            |
| `GET`    | `/categories/:id` | Busca uma categoria pelo `id`               | `200`             |
| `PATCH`  | `/categories/:id` | Atualiza uma categoria existente            | `200`             |
| `DELETE` | `/categories/:id` | Remove uma categoria                        | `204`             |

**Query params para listagem (`GET /categories`):**

| Parâmetro  | Tipo     | Descrição                                       |
| ---------- | -------- | ----------------------------------------------- |
| `page`     | `number` | Página atual (padrão: `1`)                      |
| `per_page` | `number` | Itens por página (padrão: `15`)                 |
| `sort`     | `string` | Campo de ordenação: `name` ou `created_at`      |
| `sort_dir` | `string` | Direção: `asc` ou `desc`                        |
| `filter`   | `string` | Substring case-insensitive aplicada ao `name`   |

**Corpo para criação (`POST`):**

```json
{
  "name": "Comédia",
  "description": "Filmes de comédia",
  "is_active": true
}
```

**Corpo para atualização (`PATCH`):** todos os campos são opcionais.

---

### Membros do Elenco — `/cast-members`

| Método   | Rota                | Descrição                                       | Status de sucesso |
| -------- | ------------------- | ----------------------------------------------- | ----------------- |
| `POST`   | `/cast-members`     | Cria um novo membro de elenco                   | `201`             |
| `GET`    | `/cast-members`     | Lista membros (filtro, ordenação, página)       | `200`             |
| `GET`    | `/cast-members/:id` | Busca um membro pelo `id`                       | `200`             |
| `PATCH`  | `/cast-members/:id` | Atualiza um membro existente                    | `200`             |
| `DELETE` | `/cast-members/:id` | Remove um membro                                | `204`             |

**Query params para listagem (`GET /cast-members`):**

| Parâmetro       | Tipo     | Descrição                                        |
| --------------- | -------- | ------------------------------------------------ |
| `page`          | `number` | Página atual (padrão: `1`)                       |
| `per_page`      | `number` | Itens por página (padrão: `15`)                  |
| `sort`          | `string` | Campo de ordenação: `name` ou `created_at`       |
| `sort_dir`      | `string` | Direção: `asc` ou `desc`                         |
| `filter[name]`  | `string` | Substring case-insensitive aplicada ao `name`    |
| `filter[type]`  | `number` | Tipo exato: `1` (Diretor) ou `2` (Ator)         |

**Corpo para criação (`POST`):**

```json
{
  "name": "Steven Spielberg",
  "type": 1
}
```

> `type`: `1` = Diretor, `2` = Ator

**Corpo para atualização (`PATCH`):** todos os campos são opcionais.

---

### Respostas de erro

| Status | Causa                                       |
| ------ | ------------------------------------------- |
| `404`  | Recurso não encontrado pelo `id` informado  |
| `422`  | Dados inválidos (falha de validação de domínio) |
| `500`  | Erro interno inesperado                     |

Exemplo de resposta `422`:

```json
{
  "message": "Validation Error",
  "errors": {
    "name": ["name should not be empty"]
  }
}
```

---

## Casos de Uso (Application Layer)

### Category

| Use Case                  | Descrição                                                     |
| ------------------------- | ------------------------------------------------------------- |
| `CreateCategoryUseCase`   | Cria uma nova categoria                                       |
| `UpdateCategoryUseCase`   | Atualiza nome, descrição ou status de uma categoria existente |
| `DeleteCategoryUseCase`   | Remove uma categoria pelo `id`                                |
| `GetCategoryUseCase`      | Recupera uma categoria pelo `id`                              |
| `SearchCategoriesUseCase` | Lista categorias com filtro, ordenação e paginação            |

Saída padronizada via `CategoryOutput`:

```typescript
type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};
```

### CastMember

| Use Case                   | Descrição                                                            |
| -------------------------- | -------------------------------------------------------------------- |
| `CreateCastMemberUseCase`  | Cria um novo membro de elenco                                        |
| `UpdateCastMemberUseCase`  | Atualiza nome ou tipo de um membro existente                         |
| `DeleteCastMemberUseCase`  | Remove um membro pelo `id`                                           |
| `GetCastMemberUseCase`     | Recupera um membro pelo `id`                                         |
| `SearchCastMembersUseCase` | Lista membros com filtro por `name` e/ou `type`, ordenação e paginação |

Saída padronizada via `CastMemberOutput`:

```typescript
type CastMemberOutput = {
  id: string;
  name: string;
  type: CastMemberType; // 1 = Diretor, 2 = Ator
  created_at: Date;
};
```

---

## Validação

As entidades utilizam `class-validator` com o mesmo padrão em todo o projeto. Quando a validação falha, um `EntityValidationError` é lançado com os erros organizados por campo, que a camada de API converte em resposta `422`.

**Category (`name`):**
- Não pode ser vazio (`@IsNotEmpty`)
- Não pode conter apenas espaços em branco (`@Matches(/\S+/)`)
- Máximo de 255 caracteres (`@MaxLength(255)`)

**CastMember:**
- `name`: não pode ser vazio, não pode conter apenas espaços em branco, máximo de 255 caracteres
- `type`: deve ser `1` (Diretor) ou `2` (Ator) — validado via `@IsIn([1, 2])`

---

## Testes

O projeto aplica a **Pirâmide de Testes** completa:

| Nível        | Local                             | Ferramenta          |
| ------------ | --------------------------------- | ------------------- |
| Unitários    | `domain/__tests__/`               | Jest                |
| Integração   | `application/use-cases/**/__tests__/` e `infra/db/**/__tests__/` | Jest |
| E2E          | `infra/api/__tests__/`            | Jest + Supertest    |

### Executar testes

```bash
# Todos os testes com cobertura
npm run test:cov

# Modo watch
npm run test:watch
```

**Cobertura mínima exigida: 80%** (branches, functions, lines e statements).

---

## Repositório

- **`InMemoryRepository`** — operações básicas de CRUD (`insert`, `findById`, `findAll`, `update`, `delete`).
- **`InMemorySearchableRepository`** — estende o anterior adicionando `search` com suporte a filtro, ordenação e paginação.

#### CategoryInMemoryRepository

| Comportamento    | Detalhe                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| Filtro por nome  | Substring case-insensitive                                             |
| Ordenação padrão | `created_at` decrescente quando `sort` não é informado                 |
| Paginação        | `page`, `per_page` (padrão: 15), `last_page` calculado automaticamente |

#### CastMemberInMemoryRepository

| Comportamento    | Detalhe                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| Filtro por nome  | Substring case-insensitive                                             |
| Filtro por tipo  | Correspondência exata com `CastMemberType` (1 ou 2)                   |
| Filtro combinado | `name` e `type` podem ser aplicados simultaneamente                    |
| Ordenação padrão | `created_at` decrescente quando `sort` não é informado                 |
| Paginação        | `page`, `per_page` (padrão: 15), `last_page` calculado automaticamente |

---

## Requisitos

- Node.js 20+
- npm

## Como Começar

### Local (sem Docker)

```bash
npm install
npm run start:dev
```

O servidor estará disponível em `http://localhost:3000`.

### Docker (desenvolvimento)

```bash
docker compose up
```

---

## Scripts Disponíveis

| Script               | Descrição                                           |
| -------------------- | --------------------------------------------------- |
| `npm test`           | Executa todos os testes com cobertura de código     |
| `npm run test:cov`   | Executa todos os testes com cobertura de código     |
| `npm run test:watch` | Executa os testes em modo watch                     |
| `npm run tsc:check`  | Verifica tipagem TypeScript sem gerar build         |
| `npm run build`      | Compila o TypeScript para `dist/`                   |
| `npm run start:dev`  | Inicia o servidor de desenvolvimento com hot-reload |

---

## Docker

O `Dockerfile` utiliza multi-stage builds:

| Stage         | Finalidade                                          |
| ------------- | --------------------------------------------------- |
| `base`        | Node 20 Alpine com dependências instaladas          |
| `development` | Monta o código-fonte, executa via nodemon + ts-node |
| `build`       | Compila o TypeScript                                |
| `production`  | Imagem mínima apenas com o output compilado         |

---

## Tecnologias

- **TypeScript 5** — modo strict, target ES2020
- **Express 4** — framework HTTP para a camada de API REST
- **class-validator** — validação declarativa com decorators
- **reflect-metadata** — suporte a metadados para decorators
- **Jest + ts-jest** — testes com cobertura de código
- **Supertest** — testes E2E da API HTTP
- **nodemon + ts-node** — hot-reload em desenvolvimento
- **Docker** — ambientes de desenvolvimento e produção em contêiner
