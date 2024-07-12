# plann.er - planejamento de viagens

## Descrição

Este é um aplicativo de planejamento de viagem desenvolvido utilizando React Native e Expo. O aplicativo permite criar viagens, convidar pessoas, adicionar atividades e links importantes, além de visualizar os convidados e o status de aceite.

## Tecnologias Utilizadas

<span>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.3.3-blue.svg?style=flat-square" alt="ts version">
  </a>
  <a href="https://reactnative.dev/">
    <img src="https://img.shields.io/badge/ReactNative-0.74.3-blue.svg?style=flat-square" alt="rn version">
  </a>
  <a href="https://docs.expo.dev/">
    <img src="https://img.shields.io/badge/Expo-51.0.18-blue.svg?style=flat-square" alt="expo version">
  </a>
  <a href="https://www.nativewind.dev/">
    <img src="https://img.shields.io/badge/NativeWind-4.0.1-blue.svg?style=flat-square" alt="native wind version">
  </a>
</span>

## Bibliotecas Adicionais

- **Axios:** Para lidar com as requisições HTTP.
- **Day.js:** Para formatação de datas.
- **Async Storage:** Para armazenar dados localmente no dispositivo.
- **clsx:** Para seleção condicional de estilos.
- **React Native Calendar:** Para renderização de calendários.
- **React Native Reanimated:** Para animações de transições.
- **React Native SVG:** Para renderização de SVGs.
- **Expo:** Diversas bibliotecas nativas como expo-blur, expo-font, expo-linking, etc.
- **Expo Router:** Solução de roteamento baseada em arquivos.
- **Lucide React Native:** Biblioteca de ícones.

## Funcionalidades

- **Criar Viagem:** Selecionar data de ida e volta e local.
- **Convidar Pessoas:** Convidar pessoas via email para participar da viagem.
- **Adicionar Atividades:** Adicionar atividades com data e hora.
- **Adicionar Links Importantes:** Adicionar links relevantes para a viagem.
- **Visualizar Convidados:** Verificar quem foi convidado e o status de aceite.
- **Deep Linking:** Convidados recebem um email com um link que direciona para a viagem no app.

## Dependências

- **Node.js:** Versão 20.15.1 ou superior.
- **Android Studio:** Configurado na máquina com um emulador Android 13.0 ou superior instalado.

## Instruções para Rodar o Projeto

1. Clone o repositório.
2. Execute `npm install` na pasta raiz e na pasta server.
3. Na pasta server, execute `npm run dev`.
4. Na pasta raiz, execute `npm expo start`.
5. Após inicializar, selecione a opção desejada. Para rodar no emulador Android, utilize o atalho "a".

## Estrutura de Arquivos

```plainText
planner-viagens-NLW/
├── android/               # Arquivos nativos do Android
├── assets/                # Imagens e recursos auxiliares
│   └── images/            # Imagens utilizadas na aplicação
├── server/                # Backend do projeto
├── src/                   # Código fonte do projeto
│   ├── app/               # Páginas e rotas da aplicação
│   ├── assets/            # Recursos específicos da aplicação
│   ├── components/        # Componentes reutilizáveis
│   ├── server/            # Requisições ao server
│   ├── storage/           # Manipulação de armazenamento local
│   ├── styles/            # Estilos globais e utilitários
│   ├── types/             # Definições de tipos TypeScript
│   └── utils/             # Funções utilitárias
└── README.md              # Documentação do projeto
```

## Autores

- [@orodrigogo](https://github.com/orodrigogo)
- [@pedrotonin](https://www.linkedin.com/in/pedro-henrique-de-avila-tonin-6b96801a1/?locale=en_US)