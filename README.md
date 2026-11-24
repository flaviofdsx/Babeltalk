# BabelTalk

Aplicativo desktop de mensagens que ajuda você a escolher o tom certo e conversar entre regiões e idiomas.

[![Build](https://github.com/flaviofdsx/Babeltalk/actions/workflows/build.yml/badge.svg)](https://github.com/flaviofdsx/Babeltalk/actions/workflows/build.yml)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](LICENSE)

## Funcionalidades

- Gere três versões da mensagem antes de enviar: **Formal**, **Coloquial** e **Tosco**.
- Use OpenRouter com DeepSeek V4 Flash Free por padrão ou selecione OpenAI nas configurações.
- Adapte expressões regionais considerando o perfil de quem envia e de quem recebe.
- Cadastre contatos com país, estado ou província, cidade, idioma e observações.
- Traduza sugestões para o idioma principal do destinatário.
- Mantenha contatos, perfil e histórico de mensagens localmente no dispositivo.
- Edite e remova contatos e configure o modelo de IA usado pelo app.

## Stack

- Electron
- React e TypeScript
- Vite e TailwindCSS
- Zustand
- SQLite com `better-sqlite3`
- OpenAI SDK
- `electron-builder`

## Pré-requisitos

- Node.js 20.19 ou superior
- npm
- Uma chave de API da OpenAI para gerar sugestões

## Instalação

```bash
git clone https://github.com/flaviofdsx/Babeltalk.git
cd Babeltalk
npm install
```

## Configuração

Na primeira execução, abra **Configurações** no BabelTalk, selecione OpenRouter ou OpenAI e informe a chave e o modelo desse provedor. Em instalações novas, o padrão é OpenRouter com `deepseek/deepseek-v4-flash`; OpenAI com `gpt-4o-mini` continua disponível como alternativa. As chaves são protegidas com `safeStorage` do Electron.

Para desenvolvimento local, é opcional copiar `.env.example` para `.env` e preencher as variáveis. O app só carrega `.env` quando iniciado com `NODE_ENV=development`; o comando `npm run dev` configura esse modo automaticamente. Em produção, o arquivo `.env` é ignorado. Nunca adicione chaves reais ao repositório.

## Como rodar em desenvolvimento

```bash
npm run dev
```

## Como gerar build

Compile a aplicação:

```bash
npm run build
```

Para gerar o instalador da plataforma atual:

```bash
npm run dist
```

O workflow também gera instaladores Windows (NSIS), macOS (DMG) e Linux (AppImage) em tags de release `v*`.

## Como contribuir

Leia o [guia de contribuição](CONTRIBUTING.md) antes de abrir uma issue ou pull request.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
