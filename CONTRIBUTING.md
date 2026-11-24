# Como contribuir

Obrigado por ajudar a melhorar o BabelTalk! Para manter a colaboração simples e segura, siga estas orientações.

## Reportar bugs

Antes de abrir uma issue, procure por relatos semelhantes nas [issues existentes](https://github.com/flaviofdsx/Babeltalk/issues). Para reportar um bug, use o [template de bug](.github/ISSUE_TEMPLATE/bug_report.md) e inclua passos reproduzíveis, o resultado esperado e informações do ambiente. Remova chaves de API, dados pessoais e outros segredos de logs e capturas de tela.

## Sugerir funcionalidades

Use o [template de solicitação de funcionalidade](.github/ISSUE_TEMPLATE/feature_request.md). Explique o problema que deseja resolver, a solução que imagina e as alternativas consideradas. Se possível, aguarde a discussão da proposta antes de começar uma mudança grande.

## Contribuir com código

1. Faça um fork do repositório e clone seu fork.
2. Crie uma branch a partir de `main`, com um nome claro, por exemplo `fix/contact-form`.
3. Instale as dependências com `npm install`.
4. Implemente uma mudança focada e atualize a documentação relacionada.
5. Valide localmente:

   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

6. Faça commits pequenos com mensagens claras.
7. Abra um pull request para `main` e preencha o [template de PR](.github/PULL_REQUEST_TEMPLATE.md), vinculando a issue relacionada quando houver.

Não faça commit de `.env`, chaves da OpenAI, bancos SQLite locais, arquivos de build ou dados pessoais.

## Padrões de código

- TypeScript é compilado em modo `strict`; mantenha os tipos explícitos e evite `any`.
- Use ESLint para identificar problemas e Prettier para manter a formatação consistente.
- Siga os padrões e componentes já existentes antes de adicionar novas abstrações.
- Prefira mudanças pequenas, acessíveis e acompanhadas de documentação ou testes relevantes.

## Comunicação e convivência

Seja respeitoso e construtivo. Descreva problemas com clareza, aceite feedback de revisão e mantenha as discussões focadas no código e na experiência de quem usa o BabelTalk.
