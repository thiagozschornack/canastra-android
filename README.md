# CANASTRA — EmpreenderTHZ Games · App Android (V10.0)

App Android nativo (Kotlin + WebView) que empacota o jogo web V10 Final.
Roda 100% offline: os arquivos do jogo ficam dentro do APK (`app/src/main/assets/www`)
e são servidos pelo `WebViewAssetLoader` numa origem HTTPS local — módulos ES,
`localStorage` (partida salva, estatísticas, ajustes) e sons funcionam sem servidor.

- Pacote: `com.empreenderthz.canastra` · versionCode 10 · versionName 10.0
- Android 7.0+ (minSdk 24) · targetSdk 35 (exigência atual da Google Play)

## O que foi adaptado para Android
| Item | Comportamento no app |
|---|---|
| Ícone | Ícone adaptativo (Android 8+) e ícones legados em todas as densidades, a partir do ícone do PWA |
| Abertura | Splash nativa (Android 12+) com o naipe ♠ sobre o feltro verde |
| Tela | Edge-to-edge, sem cortes sob barra de status, navegação ou câmera; gira em retrato e paisagem sem reiniciar a partida |
| Botão Voltar | Fecha a janela aberta (Regras, Ajustes, Estatísticas…); na mesa, manda o app para segundo plano sem perder a partida |
| Segundo plano | Bots e temporizadores ficam congelados enquanto o app não está visível |
| Exportar histórico | Abre o compartilhamento do Android (salvar no Drive, enviar por WhatsApp/e-mail etc.) |
| Service worker | Desativado no app (desnecessário; evita cache antigo após atualizações) |

Mudanças no código web: só duas — `index.html` carrega `android-bridge.js` e
`app.mjs` não registra o service worker quando está no app. O navegador continua
funcionando igual.

## Gerar o APK

### Opção 1 — GitHub Actions (sem instalar nada)
1. Crie um repositório e envie esta pasta inteira.
2. A aba **Actions** roda o workflow *Android build*: executa os testes do motor do jogo e gera o APK de teste.
3. Baixe o artefato **canastra-debug-apk**, copie para o celular e instale (permita "instalar apps desconhecidos").

### Opção 2 — Android Studio
Abra a pasta no Android Studio (Ladybug ou mais novo), aguarde o *Gradle sync* e clique em ▶ Run,
ou use **Build › Build App Bundle(s) / APK(s)**.

Linha de comando: `./gradlew assembleDebug` → `app/build/outputs/apk/debug/app-debug.apk`

## Publicar na Google Play
1. Crie a chave de upload (guarde o arquivo e as senhas — sem ela não há atualizações):
   ```
   keytool -genkeypair -v -keystore canastra-release.jks -alias canastra -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **Local:** copie `keystore.properties.example` para `keystore.properties`, preencha e rode
   `./gradlew bundleRelease` → `app/build/outputs/bundle/release/app-release.aab`.
3. **GitHub Actions:** em *Settings › Secrets and variables › Actions* crie
   `CANASTRA_KEYSTORE_BASE64` (saída de `base64 -w0 canastra-release.jks`),
   `CANASTRA_KEYSTORE_PASSWORD`, `CANASTRA_KEY_ALIAS` e `CANASTRA_KEY_PASSWORD`.
   O workflow passa a gerar também o artefato **canastra-release** (AAB + APK assinados).
4. Envie o `.aab` no Play Console. Formulário *Segurança dos dados*: o app não coleta nem compartilha dados
   (tudo fica no aparelho). Classificação: jogo de cartas **sem apostas e sem dinheiro real**.

A cada nova versão, aumente `versionCode` (e `versionName`) em `app/build.gradle.kts`.

## Atualizar o jogo
Substitua os arquivos em `app/src/main/assets/www/` pela nova versão web, mantendo
`android-bridge.js`, a linha `<script src="android-bridge.js"></script>` no `index.html`
e o `&&!window.ThzAndroid` no registro do service worker em `app.mjs`.

## Testes
`web-tests/` guarda os testes originais (V4–V10). O workflow os executa contra os arquivos do app.
Antes de publicar, teste no aparelho: partida completa, retomar após fechar o app, girar a tela,
botão Voltar com janelas abertas e Exportar histórico.
