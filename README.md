# 🛡️ Preparação TAF PMMG

Plataforma web de treino híbrido (musculação 🏋️ e corrida 🏃) para a preparação ao TAF da Polícia Militar de Minas Gerais. Cada usuário tem login próprio 🔐, registra seus treinos e acompanha a evolução do grupo em um gráfico geral 📊.

## 🌐 Acessar o site

Para acessar o site, clique no link:

<!-- COLE O LINK AQUI -->

## ✨ Funcionalidades

- Plano semanal de segunda a domingo, com descanso leve no domingo
- Login individual por usuário e senha
- Registro de km corridos, minutos, exercícios feitos, esforço e observações
- Gráfico geral semanal compartilhado entre todos os usuários (km, treinos ou exercícios)
- Histórico pessoal de treinos, com opção de apagar registros

## 🧰 Tecnologias

- HTML, CSS e JavaScript puro
- Firebase Authentication e Cloud Firestore
- Hospedagem no Vercel

## 🚀 Como rodar

1. Baixe ou clone este repositório.
2. Abra a pasta no VS Code, instale a extensão **Live Server** e abra o `index.html` com ela.
3. Sem configurar nada, o app roda em **modo local**: os dados ficam só no navegador.

## 🔥 Configurar o Firebase (gráfico geral compartilhado)

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com).
2. Registre um app **Web** (`</>`) e copie `apiKey`, `authDomain`, `projectId` e `appId` para o arquivo `firebase-config.js`.
3. Em **Authentication**, ative o método **E-mail/senha**.
4. Em **Firestore**, crie o banco em modo de produção e publique estas regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /logs/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```



## ⚠️ Aviso

O plano de treino é uma base geral. Ajuste cargas e ritmos ao seu nível e confira as provas e os índices do TAF no edital do concurso.
