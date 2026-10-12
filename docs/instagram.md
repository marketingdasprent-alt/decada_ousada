# Instagram: ligar as publicações ao site

As últimas publicações de `@decada_ousada` aparecem no fim da página inicial
e na landing `/motoristas`. O site lê-as no servidor (`src/services/instagram`)
e guarda-as em cache durante alguns minutos. Enquanto a conta não estiver
ligada, as secções não aparecem (a landing mostra fotos da frota com ligação
para o perfil).

Há duas formas de ligar a conta. Basta uma.

## Opção A: Behold (a mais simples)

O Behold guarda e renova o acesso ao Instagram. O site só recebe um URL
público com as publicações.

1. Quem tem acesso à conta `@decada_ousada` entra em behold.so e liga o
   Instagram.
2. Cria um feed do tipo **JSON** e copia o URL ("JSON feed URL").
3. Na Vercel (Settings → Environment Variables), cria
   `INSTAGRAM_FEED_URL` com esse URL e faz **Redeploy**.

## Opção B: API oficial da Meta (sem serviço externo)

1. A conta `@decada_ousada` tem de ser **Profissional** (Empresa ou
   Criador): Instagram → Definições → Tipo de conta.
2. Em developers.facebook.com, criar uma app do tipo **Business** e
   adicionar o produto **Instagram → API setup with Instagram login**.
3. Em "Generate access tokens", adicionar a conta `@decada_ousada` (fica
   com função na app, por isso não é preciso pedir revisão à Meta) e gerar o
   token. A única permissão necessária é `instagram_business_basic`.
4. Na Vercel, criar `INSTAGRAM_ACCESS_TOKEN` com o token e fazer
   **Redeploy**.

O token de longa duração expira ao fim de **60 dias**. Para o prolongar,
antes de expirar:

```bash
curl "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=TOKEN_ATUAL"
```

A resposta traz o token renovado (`access_token`) e a validade
(`expires_in`, em segundos). Se o valor mudar, atualizar a variável na Vercel.
Quando o site tiver base de dados (`DATABASE_URL`), esta renovação pode
passar a ser automática.

## Regras

- O token só existe no servidor: nunca com prefixo `NEXT_PUBLIC_`, nunca
  num repositório, nunca colado em conversas.
- Os links das imagens do Instagram são temporários: o site não os guarda,
  só os mostra.
- Para testar localmente, pôr a mesma variável em `.env.local` e abrir
  `/api/instagram`: deve devolver `posts` com as últimas publicações.
