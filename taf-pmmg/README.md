# Preparação TAF PMMG

## Rodar no VS Code
1. Instale a extensão **Live Server**, clique com o botão direito em `index.html` > *Open with Live Server*.
2. Sem configurar nada, roda em **modo local** (dados só no seu navegador, cada usuário com senha).

## Gráfico geral entre os 3 (Firebase, grátis)
1. Acesse console.firebase.google.com > **Adicionar projeto**.
2. **Build > Authentication > Começar > E-mail/senha > Ativar**.
3. **Build > Firestore Database > Criar banco** (modo produção) e, na aba **Regras**, cole:
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
4. **Configurações do projeto > Seus apps > Web (</>)**: registre o app e copie `apiKey`, `authDomain`, `projectId`, `appId` para `firebase-config.js`.
5. **Authentication > Settings > Authorized domains**: adicione seu domínio do Vercel (ex.: `meuapp.vercel.app`).

## Hospedar no Vercel
- Pelo site: vercel.com > Add New > Project > envie a pasta (ou suba no GitHub e importe). Framework: **Other**, sem build.
- Pelo terminal: `npx vercel` dentro da pasta, depois `npx vercel --prod`.
