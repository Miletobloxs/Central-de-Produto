# 🛑 PROTOCOLO DE SEGURANÇA: Automação de Auditoria

> **ESTADO:** MANDATÓRIO (P0)
> **OBJETIVO:** Impedir qualquer alteração de dados, lançamento de notas ou envios não autorizados no DreamShaper.

---

## 1. Regra de Ouro (Read-Only)
**A IA e todos os robôs (Bot 1, 2, 3) são estritamente LEITORES.** 
- É terminantemente PROIBIDO clicar em botões de: `Salvar`, `Concluir Avaliação`, `Enviar`, `Finalizar`.
- É terminantemente PROIBIDO digitar notas ou preencher campos de texto na interface de avaliação, exceto se houver ordem explícita e específica do usuário para aquele projeto/disciplina.

## 2. Detecção Dinâmica de Submissão (Somatório Multi-fator)
O robô deve ser dinâmico e preciso. Uma atividade só é considerada "crinta para extração" se atender ao **SOMATÓRIO OBRIGATÓRIO** de TRÊS elementos simultâneos:

1.  **Campo Azul:** O card deve ter cor de fundo azul (ou gradiente azul), indicando estado de envio/ativo.
2.  **Símbolo Verde:** Deve existir o ícone de balão de comentário verde (feedback) dentro do card.
3.  **Nomenclatura Específica:** O card deve estar nomeado obrigatoriamente como "Atividade 1", "Atividade 2", "Atividade 3" ou "Atividade 4".

**Mapeamento de Notas Indivíduais:**
- É OBRIGATÓRIO que o Bot 1 colete as notas individuais de cada critério/unidade.
- O Consolidador deve mapear essas notas para as seções correspondentes ("Atividade 1", etc.) no relatório final, garantindo 100% de visibilidade dos dados.

**Se qualquer um desses 3 elementos estiver ausente, o robô NÃO deve clicar no card.**
- Cards Pretos (mesmo que se chamem Atividade X) = PULAR.
- Cards Azuis sem ícone verde = PULAR.
- Cards Azuis com ícone verde mas com outro nome (ex: Pitch, Capa) = PULAR.

## 3. Navegação Segura (Sem Atalhos)
- **Link Oficial de Acesso:** Deve-se usar exclusivamente o link de redirecionamento SSO fornecido (gateway/lti/sso/redirect).
- **Turma Alvo:** Entrar obrigatoriamente na turma **SPGSA25DESIGN4**.
- Proibido o uso de `page.goto()` para URLs internas de projetos (evita 404 e quebras de sessão).
- A navegação deve ser baseada em CLIQUES nos elementos da interface: `Dashboard -> Seleção da Turma -> Lista de Projetos -> Seleção por ID -> Capa -> Modo de Visualização`.

## 4. Consequências de Violação
Qualquer tentativa de cruzamento desta linha (como o lançamento de "notas fantasma") é considerada uma falha crítica de protocolo que compromete a credibilidade institucional e acadêmica.

---
*Este protocolo é permanente e deve ser lido e aplicado antes de qualquer execução de script.*
