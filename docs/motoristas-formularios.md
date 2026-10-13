# Formulários de motoristas (/motoristas)

## Hoje: o formulário do WeGest num popup

`DRIVER_FORM_OPEN = "popup"` (`src/domain/drivers`). Todos os botões de
candidatura (os cartões do topo e da secção "Comece a faturar já", os botões
da secção Aluguer ou Slot e o selo "2 min") abrem um popup na mesma página com
o formulário do WeGest já carregado: "Preciso de carro" o TVDE GERAL, "Tenho
carro" o SLOT. O WeGest permite a incorporação desde 2026-10-13
(`frame-ancestors *`).

O endereço do embed leva `&origem=site` e, no popup, um código novo a cada
abertura (`&v=…`). Um browser que tenha guardado uma resposta do WeGest com
bloqueio (`X-Frame-Options` ou `frame-ancestors`) nunca a reutiliza: o WeGest
responde 304 quando o HTML não muda, e um 304 não apaga da cache o cabeçalho
antigo (aconteceu duas vezes a 2026-10-13, com `ERR_BLOCKED_BY_RESPONSE`). A
página do WeGest já é `max-age=0`, por isso não se perde cache.

Com `DRIVER_FORM_OPEN = "tab"` os mesmos botões abrem o formulário noutro
separador. A secção mostra os cartões (`DRIVER_FORM_KIND = "links"`).

## Formulários do WeGest incorporados (`DRIVER_FORM_KIND = "embed"`)

A secção mostra o
formulário do WeGest dentro da página (`?embed=1`), com a escolha "Preciso de
carro" / "Tenho carro". A altura acompanha o formulário: o WeGest envia
`{ tipo: "wegest-formulario:altura", altura }` por postMessage e o site só
aceita mensagens de `https://www.wegest.pt` vindas do próprio iframe.

**Para aparecer, o WeGest tem de deixar incorporar.** Em 2026-10-13 o
`?embed=1` ainda respondia `X-Frame-Options: DENY`, e o browser não mostra o
iframe. Do lado do WeGest: retirar o `X-Frame-Options` nas respostas com
`?embed=1` e enviar
`Content-Security-Policy: frame-ancestors https://www.decadaousada.pt https://decadaousada.pt https://decada-ousada.vercel.app`.
Enquanto isso não acontece, se não chegar a primeira mensagem de altura 8 s
depois de o formulário estar à vista, o site troca o iframe por um botão que
abre o formulário noutro separador. Quando o WeGest permitir, passa a
aparecer sem novo deploy.

Os botões "Preciso de carro" e "Tenho carro" (topo, secção Aluguer ou Slot,
selo "2 min") abrem o formulário do WeGest diretamente, noutro separador
(`DRIVER_FORM_OPEN = "tab"`, `applyLink`). Quando o WeGest deixar incorporar,
`DRIVER_FORM_OPEN = "popup"` faz os mesmos botões abrirem o formulário num
popup (`DriverApplyDialog`) em vez de outro separador.

Para voltar aos formulários do próprio site, `DRIVER_FORM_KIND = "site"`
(secções abaixo).

## Formulários do próprio site (`DRIVER_FORM_KIND = "site"`)

Dois formulários na secção "Comece a faturar já", com os mesmos campos dos
formulários públicos do WeGest:

| Modalidade | Campos | Entra no WeGest como |
|---|---|---|
| **Preciso de carro** (Aluguer) | Nome, email, telefone/WhatsApp, "Tem licença TVDE?", observações | Lead do formulário "Formulário Geral", campanha **TVDE GERAL** |
| **Tenho carro** (Slot) | Nome, email, telefone/WhatsApp, "Atualmente trabalha como motorista TVDE?", viatura | Lead do formulário "Slot", campanha **SLOT** |

Os botões "Candidatar-me ao Aluguer" e "Candidatar-me como Slot" levam a
`#candidatura-aluguer` e `#candidatura-slot`, que abrem o formulário certo.

## Como chega ao WeGest

A API pública do WeGest não tem leads (só candidaturas completas, em
`POST /tvde/candidaturas`). O servidor do site grava o lead como os
formulários públicos do WeGest o fazem: na tabela `leads_dasprent`, com o
mesmo `formulario_id`, a mesma campanha e as respostas em `observacoes`
(mais uma linha "Origem: Site DÉCADA OUSADA, página /motoristas"). A equipa
vê-os no mesmo sítio que os leads de hoje.

Regras iguais às do WeGest: no Aluguer, quem responde "Não" à licença TVDE vê
o aviso de que a licença é obrigatória e não consegue enviar. No Slot, "Não"
na pergunta sobre trabalhar como TVDE é aceite (no formulário do WeGest
também bloqueava; aqui não, porque a pergunta é sobre a atividade atual e não
sobre a licença).

Quando esta ligação passar a existir na API oficial do WeGest, só muda
`src/services/leads`.

## Configurar (Vercel → Settings → Environment Variables)

| Variável | Valor |
|---|---|
| `WEGEST_LEADS_URL` | `https://hkqzzxgeedsmjnhyquke.supabase.co` |
| `WEGEST_LEADS_KEY` | Chave pública ("anon") que os formulários do WeGest usam. Pedir ao responsável do WeGest |
| `TURNSTILE_SITE_KEY` | Chave do site no Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | Chave secreta do Turnstile (só no servidor) |

Depois de criar as variáveis, fazer um novo deploy.

- **Sem `WEGEST_LEADS_URL` e `WEGEST_LEADS_KEY`** (com `WEGEST_MODE=http`), a
  página mostra os botões para os formulários alojados no WeGest. Nunca há um
  formulário que não consegue enviar.
- **Sem as chaves do Turnstile**, o formulário funciona só com o
  campo-armadilha contra robôs. Ligar o Turnstile antes de anunciar a página.

### Turnstile (CAPTCHA da Cloudflare, gratuito)

1. Quem gere o domínio cria uma conta em dash.cloudflare.com (não é preciso
   mudar o DNS para a Cloudflare).
2. **Turnstile → Add widget**: nome "Site DÉCADA OUSADA", domínios
   `decadaousada.pt` e `decada-ousada.vercel.app`, modo **Managed**.
3. Copiar a *Site Key* para `TURNSTILE_SITE_KEY` e a *Secret Key* para
   `TURNSTILE_SECRET_KEY`.

Para desenvolvimento há chaves de teste públicas da Cloudflare, que passam
sempre: site `1x00000000000000000000AA`, secreta
`1x0000000000000000000000000000000AA`.

## Testar

- Com `WEGEST_MODE=mock` o envio não grava nada (demonstração).
- O primeiro envio real deve ser combinado com a equipa: cria um lead
  verdadeiro no WeGest, que depois apagam.
