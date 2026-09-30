# Veste Bem Moda Homem — landing page

Página única para a **Veste Bem Moda Homem** (aluguel e venda de trajes masculinos, São Leopoldo/RS).
O objetivo é levar o visitante até a loja física: todos os caminhos terminam em **Como chegar** (rota no Google Maps) ou **WhatsApp**.

HTML, CSS e JavaScript puros, sem build e sem npm.

```
index.html         a página
css/style.css      todo o visual
js/main.js         animações e interações
imagens/           as 9 imagens do site (não renomeie)
favicon.svg        ícone da aba
```

## Como abrir e publicar

- **Conferir:** abra o `index.html` com dois cliques. Funciona direto do disco, sem servidor.
- **Publicar no GitHub Pages:** o workflow `.github/workflows/pages.yml` publica o site a cada push. Na primeira vez, ative em *Settings → Pages → Build and deployment → Source: GitHub Actions*. O endereço fica `https://theusmkt.github.io/PAGINA-VESTE-BEM/`.
- **Publicar no Netlify:** arraste a pasta do projeto para [netlify.com/drop](https://app.netlify.com/drop). Não há etapa de build.

Bibliotecas carregadas por CDN (precisam de internet): GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.3.4 (jsDelivr) e as fontes Cormorant Garamond e Jost (Google Fonts).
Se alguma CDN falhar, o site continua inteiro e legível, só sem as animações.

---

## Antes de publicar

Estes dados são **de exemplo** e precisam ser confirmados com a loja. Os números de linha se referem ao `index.html`, salvo indicação.

| # | O que confirmar | Onde | Valor atual |
|---|---|---|---|
| 1 | **Depoimentos reais** (os 3 cards) | linhas 658–682 (bloco `DEPOIMENTOS DE EXEMPLO`). Nomes nas linhas 665, 672 e 679 | Textos e nomes genéricos, com selo **EXEMPLO** na tela |
| 2 | **Desligar o selo "EXEMPLO"** depois de trocar os depoimentos | `js/main.js`, linha 9: `const MODO_DEMO = true;` → `false` | `true` |
| 3 | **Valor do aluguel** | linhas 603–605 (comentário `CONFIRMAR VALOR COM A LOJA`) | "a partir de R$ 350" (tirado de um post antigo do Instagram) |
| 4 | **Quantidade de trajes no acervo** | linhas 617–618: troque o `data-count="300"` **e** o texto `300` | 300+ |
| 5 | **Anos de atuação da loja** | linhas 626–627: troque o `data-count="10"` **e** o texto `10` | 10 |
| 6 | **Domínio final do site** | linha 29 (canonical), 36–37 (Open Graph), 44 (Twitter) e 64–66 (JSON-LD) | `https://www.vestebemsaoleopoldo.com.br/` |

> **Não publique depoimento inventado.** Se os depoimentos reais não chegarem a tempo, apague o bloco das linhas 658–682 inteiro. A seção continua de pé com a foto, a legenda e o botão do Instagram.

Nos números (itens 4 e 5), o `data-count` é o valor da contagem animada e o texto dentro da tag é o que aparece quando o JavaScript não roda. Os dois devem ser iguais.

## Outros pontos que vale saber

- **Logo:** o arquivo `imagens/logo-veste-bem.png` não tem fundo preto sólido. É um recorte com fundo cinza desfocado. O círculo é recortado por CSS (`.logo-disc` em `css/style.css`). Se a loja mandar o logo em PNG transparente ou SVG, dá para simplificar esse recorte.
- **Seguidores (5,2 mil):** valor real na data das capturas (5.198). Atualize de tempos em tempos (`data-count="5.2"`).
- **Horário de funcionamento** aparece em quatro lugares. Se mudar, atualize todos:
  - seção Visite;
  - CTA final;
  - rodapé;
  - JSON-LD no `<head>`.

  O indicador "aberto agora" usa a tabela `HORARIOS` em `js/main.js` e sempre calcula pelo fuso de São Paulo.
- **Links de contato:** o WhatsApp (`wa.me/5551998027766`), o Instagram e a rota do Maps se repetem em vários botões. Para trocar um deles, use "substituir tudo" no `index.html`.
- **Fotos:** o site usa só as 9 imagens de `imagens/`. As capturas do Instagram usadas como referência de marca ficaram fora do projeto de propósito.

## O que foi testado

Testado no Chromium em 360, 390, 768, 1440 e 1920 px de largura:

- sem rolagem horizontal e sem erros no console;
- galeria com pin no desktop e carrossel com snap no celular;
- menu mobile: foco preso no menu, fecha com Esc e devolve o foco ao botão;
- `prefers-reduced-motion`: tudo visível, galeria em lista, sem parallax nem smooth scroll;
- com JavaScript desligado e com as CDNs bloqueadas: todo o conteúdo visível.
