# Instagram na página inicial

A secção "Siga-nos no Instagram" mostra as últimas 8 publicações de
[@decada_ousada](https://www.instagram.com/decada_ousada/). O servidor lê-as
da Instagram API (`src/services/instagram`) e guarda-as em cache com o perfil
`minutes`: uma publicação nova aparece no site cerca de um minuto depois.

Sem fonte configurada, ou com a fonte em baixo, a secção mostra só o
título e o botão "Seguir no Instagram". O site nunca fica com um espaço vazio
nem com um erro.

Há duas formas de ligar a conta. Basta uma; se as duas existirem, o token tem
prioridade.

## Opção A: Behold (a mais simples, sem renovações)

O Behold guarda e renova o acesso ao Instagram; o site só recebe um URL com as
publicações.

1. Quem tem acesso a @decada_ousada entra em [behold.so](https://behold.so),
   liga o Instagram e cria um feed do tipo **JSON**.
2. Copiar o "JSON feed URL".
3. No Vercel, em Settings → Environment Variables, criar `INSTAGRAM_FEED_URL`
   com esse URL (Production e Preview) e fazer um novo deploy.

## Opção B: token da API oficial

### Obter o token

Requisito: @decada_ousada tem de ser uma conta profissional (Empresa ou
Criador de conteúdo), em Instagram → Definições → Tipo de conta.

1. Em [developers.facebook.com](https://developers.facebook.com/apps), criar
   uma app do tipo "Empresa".
2. Adicionar o produto **Instagram** e escolher "API setup with Instagram
   login".
3. Em "Generate access tokens", adicionar a conta @decada_ousada (é preciso
   entrar com ela) e gerar o token. Este token já é de longa duração (60
   dias) e só precisa da permissão `instagram_business_basic`.
4. No Vercel, em Settings → Environment Variables, criar
   `INSTAGRAM_ACCESS_TOKEN` com esse valor (Production e Preview) e fazer um
   novo deploy.

O token é um segredo: fica só no servidor, nunca com prefixo `NEXT_PUBLIC_`.

### Renovar o token

O token expira 60 dias depois de ser gerado ou renovado. Para o renovar (a
partir de 24 horas depois de criado):

```
https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=TOKEN_ATUAL
```

A resposta traz o `access_token` e o `expires_in` novos. Atualizar a variável
no Vercel e fazer um novo deploy. Se o token expirar, a secção volta a mostrar
só o botão até ser trocado.
