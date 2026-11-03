# Regras oficiais do preset interno: Buraco Aberto EmpreenderTHZ V10.0

**Importante:** não há um único regulamento universal para todas as mesas brasileiras de Buraco/Canastra. O conjunto abaixo é a definição adotada neste jogo e não deve ser confundido com um regulamento de torneio específico.

- **Jogadores:** 4, duplas alternadas (você/Rafa; Lia/Nina).
- **Baralho:** 2 baralhos de 52 cartas + 4 Jokers = 108 cartas.
- **Distribuição:** 11 cartas por jogador, 2 mortos de 11 cartas, uma carta inicial aberta no lixo, 41 no monte.
- **Turno:** comprar uma carta do monte ou pegar todo o lixo; baixar sequências ou acrescentar aos jogos da dupla; descartar uma carta. Pegar lixo não exige uso imediato da carta superior.
- **Jogos:** sequências de 3 ou mais cartas do mesmo naipe, sem valores naturais repetidos; Ás apenas alto, após Rei; não há trincas ou sequências circulares.
- **Curingas:** 2 e Joker são sempre curingas. Máximo de um por sequência, com pelo menos duas cartas naturais. O curinga preenche lacuna ou amplia uma extremidade. O 2 nunca é natural neste preset.
- **Canastra:** sequência com 7 ou mais cartas. Limpa sem curinga (+200); suja com curinga (+100).
- **Morto:** quando a mão acaba, a dupla que ainda não pegou morto recebe um dos dois mortos. Ao esvaziar baixando, joga imediatamente com ele; ao esvaziar descartando, aguarda a próxima vez. Cada dupla recebe no máximo um morto.
- **Batida:** depois que a dupla pegou o morto e formou uma canastra, um jogador pode terminar todas as cartas da mão baixando ou descartando.
- **Mão bloqueada:** se o jogador não puder descartar sua última carta e não houver morto disponível nem batida legal, a rodada termina sem vencedor (empate técnico).
- **Esgotamento do monte:** encerra imediatamente a rodada; as cartas restantes nas mãos são descontadas.
- **Valores:** 3–7 = 5; 8–K = 10; Ás = 15; 2 = 20; Joker = 50. Bônus de batida +100; morto não usado −100.
- **Total:** pontos das cartas baixadas + bônus de canastras + batida − cartas em mãos − morto não usado.
- **Meta:** 3.000 pontos acumulados (informativa; pode-se continuar jogando).

## Restrições e diferenças regionais

O preset não permite trincas, Ás baixo, dois curingas na mesma sequência, 2 natural, compra condicionada do lixo, nem regras de três vermelho/preto. O jogo usa os valores de pontuação acima, que podem diferir de outras mesas.

## V8 — Comandos e transparência

A interface permite consultar todas as cartas atualmente no lixo. O motor expõe `applyCommand` para validar ações sem modificar o estado original quando a ação é ilegal, e `legalActions` para testes e assistência. Não há multiplayer nesta versão.
