# Deploy na Vercel

Como pôr o site no ar na Vercel, primeiro como demonstração (dados de
demonstração, endereço `*.vercel.app`) e depois com os domínios reais.

O projeto já está preparado:
- `vercel.json` fixa as funções em Paris (`cdg1`), perto do WeGest e da futura
  base de dados na UE;
- fora do domínio real, a região escolhe-se com `?regiao=acores` ou
  `?regiao=continente` (fica guardada em cookie);
- sem `APP_URL`, o `robots.txt` bloqueia a indexação, para a demo não aparecer
  no Google.

## 1. Criar o projeto (painel da Vercel)

1. Criar a conta (de preferência em nome da DÉCADA OUSADA) e ligar o GitHub.
2. **Add New → Project** e importar `marketingdasprent-alt/decada_ousada`.
3. A Vercel deteta Next.js. Não mudar os comandos (`npm run build`).
4. Antes do primeiro deploy, configurar as variáveis do passo 2.
5. **Deploy.** A partir daí, cada push para `main` faz deploy de produção e
   cada branch ou PR tem um endereço de pré-visualização próprio.

## 2. Variáveis de ambiente (Settings → Environment Variables)

Demonstração (antes da API e da base de dados):

| Variável | Valor | Nota |
|---|---|---|
| `WEGEST_MODE` | `mock` | Dados de demonstração e faixa de aviso no topo |
| `AUTH_SECRET` | texto aleatório longo | Obrigatória em produção: sem ela o site não arranca. Gerar com o comando abaixo |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Não definir `APP_URL` nem `AZORES_APP_URL` enquanto os domínios não estiverem
ligados: a ligação "Açores / Continente" usa `?regiao=` e o site não é
indexado.

Produção (depois, com a API e os fornecedores escolhidos):

| Variável | Valor |
|---|---|
| `WEGEST_MODE` | `http` |
| `WEGEST_API_URL` | `https://api.wegest.pt/v1` |
| `WEGEST_API_KEY` | chave do WeGest (nunca com prefixo `NEXT_PUBLIC_`) |
| `DATABASE_URL` | PostgreSQL (Supabase, região UE) |
| `PAYMENT_PROVIDER`, `PAYMENT_PUBLIC_KEY`, `PAYMENT_SECRET_KEY` | fornecedor de pagamentos escolhido |
| `STORAGE_URL`, `STORAGE_SECRET` | storage privado dos documentos TVDE |
| `APP_URL` / `AZORES_APP_URL` | `https://www.decadaousada.pt` / `https://acores.decadaousada.pt` |

## 3. Domínios (Settings → Domains)

1. Adicionar `www.decadaousada.pt`, `decadaousada.pt` (redireciona para `www`)
   e `acores.decadaousada.pt`, todos no mesmo projeto.
2. Criar no DNS do domínio os registos que a Vercel indicar para cada um.
3. Quando estiverem ativos, definir `APP_URL` e `AZORES_APP_URL` e fazer
   **Redeploy**.

No domínio real a região vem só do endereço: `acores.` mostra os Açores, o
resto mostra o Continente.

## Limitação da demonstração

Enquanto não houver base de dados (`DATABASE_URL`), contas, reservas,
candidaturas e pagamentos ficam em memória. A Vercel pode correr várias
instâncias em paralelo, cada uma com a sua memória, por isso:
- o catálogo, os preços e a conta de demonstração funcionam sempre;
- uma conta nova, uma reserva ou uma candidatura podem "desaparecer" ao mudar
  de página, se o pedido seguinte cair noutra instância.

Para mostrar os fluxos ao cliente com segurança, usar a conta de demonstração.
A solução definitiva é ligar o PostgreSQL (Supabase), o passo seguinte.
