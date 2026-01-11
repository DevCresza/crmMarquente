# Guia de Integracao - Linx Commerce e Flodesk

Este documento descreve como configurar as integracoes do CRM Marquente com Linx Commerce e Flodesk.

## Fluxo de Integracao

```
Cliente se cadastra (B2B)
        |
        v
  Dados salvos no CRM
        |
        v
[Edge Function: process-registration]
        |
        +---> Envia para Linx Commerce
        |           |
        |           v
        |     Gera CLIFOR (codigo do cliente)
        |           |
        |           v
        |     Salva CLIFOR no cadastro
        |
        +---> Adiciona subscriber no Flodesk
        |           |
        |           v
        |     Dispara workflow de email
        |           |
        |           v
        |     Cliente recebe email com CLIFOR
        |
        v
  Integracao concluida
```

## Configuracao das Variaveis de Ambiente

As variaveis devem ser configuradas no Supabase Dashboard:
**Project Settings > Edge Functions > Secrets**

### Linx Commerce

```
LINX_API_URL=https://api.linxcommerce.com.br/v1
LINX_API_KEY=sua_api_key_aqui
```

**Como obter:**
1. Acesse o portal do Linx Commerce
2. Va em Configuracoes > Integracao > API
3. Gere uma nova API Key com permissao de criar clientes
4. Copie a URL base e a API Key

**Documentacao Linx:**
- Portal: https://share.linx.com.br
- Suporte: Entre em contato com seu gerente de conta Linx

### Flodesk

```
FLODESK_API_KEY=sua_api_key_aqui
FLODESK_WORKFLOW_ID=id_do_workflow_de_boas_vindas
FLODESK_SEGMENT_ID=id_do_segmento_b2b (opcional)
```

**Como obter:**
1. Acesse https://app.flodesk.com
2. Va em Account Settings > Integrations > API Keys
3. Clique em "Create API Key"
4. Copie a chave gerada

**IMPORTANTE:** API Keys nao estao disponiveis em contas de teste ou gratuitas.

### Configurando o Workflow no Flodesk

1. **Criar Custom Fields** (Campos Personalizados):
   - Va em Audience > Custom Fields
   - Crie os seguintes campos:
     - `razao_social` (Razao Social)
     - `cnpj` (CNPJ)
     - `clifor` (Codigo CLIFOR)
     - `cidade` (Cidade)
     - `uf` (UF)
     - `marca_interesse` (Marca de Interesse)
     - `tipo_cadastro` (Tipo de Cadastro)
     - `whatsapp` (WhatsApp)

2. **Criar o Workflow de Email**:
   - Va em Workflows > Create Workflow
   - Escolha "Start from scratch"
   - Configure o trigger como "API Trigger"
   - Adicione um email de boas-vindas
   - No corpo do email, use as variacoes:
     ```
     Ola {{subscriber.first_name}},

     Seu cadastro foi aprovado com sucesso!

     Codigo do Cliente (CLIFOR): {{subscriber.custom_fields.clifor}}

     Dados do cadastro:
     - Empresa: {{subscriber.custom_fields.razao_social}}
     - CNPJ: {{subscriber.custom_fields.cnpj}}
     - Tipo: {{subscriber.custom_fields.tipo_cadastro}}

     Atenciosamente,
     Equipe Marquente
     ```
   - Publique o workflow e copie o ID da URL

3. **Criar Segmento (opcional)**:
   - Va em Audience > Segments
   - Crie um segmento "Clientes B2B"
   - Copie o ID do segmento

## Testando a Integracao

### Teste Manual via API

```bash
curl -X POST \
  'https://cuafmaveberzdukxouee.supabase.co/functions/v1/process-registration' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"registrationId": "uuid-do-cadastro"}'
```

### Verificando Status

Os cadastros no CRM terao os seguintes campos atualizados:
- `clifor_code`: Codigo gerado pelo Linx
- `linx_synced_at`: Data/hora da sincronizacao com Linx
- `flodesk_synced_at`: Data/hora da sincronizacao com Flodesk
- `integration_status`: `pending`, `partial`, `completed`, ou `failed`

## Ajustes Necessarios na API do Linx

A Edge Function `process-registration` possui uma estrutura generica para a API do Linx.
Voce precisara ajustar conforme a documentacao oficial:

1. **Endpoint de criacao de cliente**: Verifique o endpoint correto
2. **Formato de autenticacao**: Bearer token, API Key header, Basic Auth, etc.
3. **Campos obrigatorios**: Ajuste o mapeamento de campos
4. **Resposta do CLIFOR**: Verifique o caminho do codigo na resposta JSON

Edite a Edge Function em:
Supabase Dashboard > Edge Functions > process-registration

## Troubleshooting

### Integracao nao esta funcionando

1. Verifique se as variaveis de ambiente estao configuradas
2. Verifique os logs da Edge Function no Supabase Dashboard
3. Teste a API do Linx diretamente com curl/Postman

### Email nao esta sendo enviado

1. Verifique se o workflow esta publicado (nao em draft)
2. Verifique se o subscriber foi adicionado ao Flodesk
3. Verifique se o workflow tem a opcao "Allow repeat subscribers" ativada

### CLIFOR nao aparece no email

1. Verifique se o custom field `clifor` foi criado no Flodesk
2. Verifique se a variacao no email usa o caminho correto: `{{subscriber.custom_fields.clifor}}`

## Suporte

- **Linx Commerce**: Entre em contato com seu gerente de conta
- **Flodesk**: https://help.flodesk.com
- **CRM Marquente**: Verifique os logs no Supabase Dashboard
