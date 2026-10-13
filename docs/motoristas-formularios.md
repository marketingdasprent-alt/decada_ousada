# Formulários de motoristas (/motoristas)

## Hoje: formulários do WeGest incorporados (teste da equipa)

`DRIVER_FORM_KIND = "embed"` (`src/domain/drivers`). A secção mostra o
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
