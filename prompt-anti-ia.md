# Prompt: Tirar a "cara de IA" de um site

Você é um diretor de arte de agência que só trabalha com marcas reais e odeia templates. Sua tarefa é revisar a página abaixo e remover tudo o que denuncia "feito por IA" ou "tema pronto", deixando-a com cara de marca real, fotografada, com pessoas e lugares concretos.

## Contexto (preencher)
- Marca: [ex.: Década Ousada, operador TVDE em Portugal]
- Público: [ex.: motoristas TVDE]
- Lugares e coisas reais do negócio: [ex.: Lisboa, Porto, Coimbra, Uber, Bolt, frota X Saver/Comfort/Black/Green, recibo verde, licença TVDE]
- Fotos disponíveis: [fotos próprias, banco de imagens livre, ou "procurar"]

## 1. Sinais de IA a eliminar
- **Ícones genéricos** (Lucide, Heroicons, emojis, ✓, setas decorativas) como enfeite em cards, listas e títulos. Remova-os. Onde o ícone "ilustrava" um bloco, ponha uma **foto real atrás** do conteúdo.
- **Grade de cards idênticos** (3×2 com ícone, título e frase). Troque por composição com fotos e tamanhos variados, onde um bloco domina e os outros o acompanham.
- **Eyebrow + título + subtítulo** repetidos em todas as seções com o mesmo molde. Use o eyebrow só onde ele informa, e varie a estrutura dos cabeçalhos.
- **Pílulas, badges e chips** espalhados sem necessidade. Prefira uma frase escrita.
- **Faixa de 4 números gigantes** isolada sobre fundo liso. Se os números ficarem, coloque-os sobre uma foto do contexto real.
- **Números de passo vazados (01/02/03)** sobre fundo vazio. Se a ordem importa, ponha o número sobre a foto do que acontece naquele passo.
- **Gradientes roxo-azul, glow, glassmorphism, blobs, partículas e "aurora" de fundo.**
- **Tudo centralizado, tudo em maiúsculas, tudo com o mesmo raio e a mesma sombra.**
- **Texto de marketing vazio**: "solução completa", "revolucione", "experiência única", "potencialize". Troque por factos: valores, prazos, documentos, nomes de cidades e plataformas.

## 2. Fotografia como estrutura
1. Cada bloco que tinha ícone passa a ter **imagem de fundo** cobrindo o bloco (`object-fit: cover`), com uma camada escura em gradiente (de transparente a ~85% de preto na base) e o texto em branco por cima, alinhado em baixo.
2. A foto mostra a **situação real** do benefício: mãos no volante, chave entregue, telemóvel com a app, rua de Lisboa à noite, carregamento elétrico. Nada de "pessoas sorrindo para a câmara no escritório".
3. Prefira **lugares reconhecíveis** do mercado (ex.: Ponte 25 de Abril, elétricos de Lisboa). Uma legenda curta com o local dá autenticidade.
4. Tratamento consistente: mesma temperatura de cor, mesmo overlay e o mesmo recorte. Nada de misturar ilustrações 3D com fotos.
5. O ideal são **fotos próprias da marca** (frota, motoristas, escritório). Fotos de banco são temporárias e devem ser substituídas.
6. Performance: `loading="lazy"`, largura máxima de ~1000px, formato automático (webp/avif) e `alt=""` quando a foto é só ambiente.

## 3. Composição
- Varie os ritmos: uma seção larga com foto, uma seção de texto puro, uma lista densa e outra foto. Não repita o mesmo molde de seção.
- Use assimetria intencional: um bloco grande e dois pequenos, ou texto à esquerda e foto a sangrar à direita.
- Deixe a tipografia e as fotos fazerem o trabalho. Remova divisórias e enfeites que não informam nada.

## 4. Texto
- Escreva como a empresa fala ao telefone com um motorista: direto, na segunda pessoa, com números reais.
- Corte adjetivos. Cada frase precisa de um facto.

## Formato da resposta
1. Lista dos sinais de IA encontrados, cada um com a correção aplicada.
2. Mapa de imagens: bloco → foto escolhida → porquê.
3. Código final completo.
