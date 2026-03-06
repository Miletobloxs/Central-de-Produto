---
description: TDD workflow — criar testes ANTES de implementar novas funcionalidades
---

# Workflow: TDD (Test-Driven Development)

> **REGRA DE OURO:** Nenhuma funcionalidade nova é implementada sem um teste RED correspondente. Este fluxo é **OBRIGATÓRIO** para o pipeline AVA.

---

## ETAPAS DO WORKFLOW

### FASE 1 — RED (Escrever o teste que vai falhar)

1. Identifique a funcionalidade a ser implementada (ex: "Bot 3 deve publicar nota no AVA")
2. Crie o arquivo de teste na pasta correta:
   - **Bots**: `tests/bots/<nome-do-bot>.test.js`
   - **Rotas API**: `tests/api/<nome-da-rota>.test.js`
3. Escreva os testes definindo o **CONTRATO** do módulo:
   - O que o módulo exporta (`run`, `buildUrl`, etc.)
   - O comportamento esperado (entradas → saídas)
   - Interações com banco de dados e APIs externas (via mocks)
4. Execute `npm test` e **confirme que os testes FALHAM** (RED)

```bash
npm test -- --testPathPattern=<nome-do-arquivo>
```

### FASE 2 — GREEN (Implementar o mínimo para passar)

5. Implemente o módulo/funcionalidade
6. O módulo **DEVE** exportar `module.exports = { run, ... }` para ser testável
7. Use o padrão `require.main === module` para entrada CLI vs módulo:
   ```js
   if (require.main === module) { run(...) }
   module.exports = { run, helperFn };
   ```
8. Execute `npm test` e **confirme que os testes PASSAM** (GREEN)

### FASE 3 — REFACTOR (Limpar o código)

9. Refatore o código sem quebrar os testes
10. Execute `npm test` novamente para confirmar que tudo continua VERDE
11. Execute `/checkpoint` para salvar o progresso

---

## ESTRUTURA DE PASTAS

```
tests/
├── api/
│   ├── models.test.js          ✅ VERDE — /api/models
│   └── <nova-rota>.test.js    (crie antes de implementar)
└── bots/
    ├── bot1_ava_discover.test.js   ✅ VERDE — extractZip, run()
    ├── bot2_ava_maestro.test.js    🔴 RED — aguardando refatoração do módulo
    └── bot3_ava_publish.test.js    🔴 RED — aguardando implementação
```

---

## CONVENÇÕES DE MOCK

```js
// ✅ CORRETO: sempre mockar dependências externas
jest.mock('../../src/db/database', () => ({
    getDB: jest.fn().mockResolvedValue({ run: jest.fn(), get: jest.fn(), all: jest.fn() })
}));
jest.mock('playwright', ...);
jest.mock('../../src/services/GeminiService', ...);

// ❌ ERRADO: chamar APIs reais ou banco real em unit tests
```

---

## COMANDOS ÚTEIS

```bash
# Rodar todos os testes
npm test

# Rodar apenas um arquivo
npm test -- --testPathPattern=bot3

# Watch mode (rerun on change)
npm test -- --watch

# Ver cobertura de código
npm test -- --coverage
```

---

## GATE DE QUALIDADE

> **Uma funcionalidade só está PRONTA quando:**
> 1. ✅ Todos os testes passam (`npm test` verde)
> 2. ✅ `SESSION_HANDOVER.md` atualizado
> 3. ✅ Commit com `/checkpoint`
