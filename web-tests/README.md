# CANASTRA — EmpreenderTHZ Games V10.0 FINAL

## Início
Hospede todos os arquivos desta pasta em um servidor HTTPS estático, por exemplo `/public_html/Canastra/`. Abra `index.html` pelo endereço HTTP(S), não pelo protocolo `file://` (módulos ES e service worker). Nenhum backend é necessário para partidas offline.

## Funcionalidades
Quatro jogadores em duas duplas, você e três bots; três dificuldades heurísticas; compra do monte/lixo, sequências, canastras, morto, batida, placar; histórico local, retomada, estatísticas, tutorial, PWA e acessibilidade básica.

## Novidades da V10
Sorteio usando Web Crypto quando disponível; encerramento idempotente; verificações de estado mais rigorosas; controles protegidos durante pausa; migração V9→V10; ícones PWA reais; cache versionado; Ajuda rápida e atalhos `?`, `H`, `S`, `V`; alvos de toque maiores e foco visível.

## Limites conhecidos
Esta é a edição final do **modo offline**, não uma implementação do multiplayer. Não há salas, backend, variantes Tranca/Buraco Fechado, sincronização entre dispositivos ou auditoria independente de regras de torneios. As regras seguem o preset próprio documentado em REGRAS.md. A IA é heurística, não probabilística completa. A reprodução determinística de histórico de ações não está implementada.

## Testes
`node test.mjs` e `node test-v4.mjs` ... `node test-v9.mjs`; `node test-v10.mjs`. Execute também testes manuais em navegador e celular antes de publicação.
