---
description: Pipeline de Segurança Mestra para Atualização Simultânea do Session Handover e Ponto de Restauração Git.
---

# Workflow: /checkpoint

> **MANDATÓRIO:** Este comando substitui o comando tradicional de `git commit`. Se o usuário pedir para "salvar o progresso", "criar ponto de restauração" ou invocar `/checkpoint`, você DEVE executar este fluxo estrito.

## OBJETIVO
Garantir que o repositório NUNCA receba um commit de "ponto de restauração" limpo sem que o cérebro da Inteligência Artificial (contexto) também seja atualizado de forma sincronizada no arquivo `SESSION_HANDOVER.md`.

## STEP-BY-STEP DO WORKFLOW

1. **Sintetizar o Progresso**
    - Leia as *Task Boundaries* recentes e o `task.md` para entender exatamente o que acabou de ser concluído.
    - Analise as decisões arquiteturais tomadas desde o último checkpoint.

2. **Atualizar Arquivo Raiz (SESSION_HANDOVER.md)**
    - Formato Estrito: `[ ] Modify` o arquivo `SESSION_HANDOVER.md` na raiz do projeto.
    - O que Inserir:
        - **Data/Hora:** Adicione a timestamp do momento do checkpoint.
        - **A Grande Refatoração:** Resumo de 1 parágrafo das vitórias técnicas (ex: "Consertado o bug X usando técnica Y").
        - **Estado da Arte:** "O sistema agora é capaz de [capacidade]".
        - **Próximo Passo Herdado:** Qual era o exato próximo passo que o Arquiteto Humano mandou fazer.

// turbo
3. **Gerar Snapshot Git**
    - Após salvar com sucesso o `SESSION_HANDOVER.md`, dispare o commit versionado usando Terminal.
    - Execute:
      ```bash
      git add .
      git commit -m "chore(checkpoint): [Sua Mensagem Aqui] + Atualização de Handover"
      ```

4. **Retorno Socrático**
    - Responda apenas: 
      `🤖 **Checkpoint Seguro Realizado!** \n O Handover cerebral e o Git Tree estão sincronizados. Prontos para a proxima etapa: [citar próximo passo do handover]`.
