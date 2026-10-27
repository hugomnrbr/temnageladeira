# Publicar Tem na Geladeira (GitHub Pages + Supabase)

## Importante antes de publicar
O site atual ainda usa `localStorage` para várias funções. Apenas colocar os arquivos no GitHub Pages NÃO sincroniza contas/receitas entre visitantes. Este pacote prepara a estrutura e o esquema do Supabase, mas a integração completa do `index.html` e `admin.html` ainda exige adaptar os fluxos do app para usar a API assíncrona do Supabase. Não anuncie como produção até fazer essa etapa e os testes.

## 1. Preparar o repositório existente
1. Faça backup/baixe o repositório atual antes de substituir arquivos.
2. Extraia o ZIP e copie o conteúdo da pasta `Tem_na_Geladeira` para a raiz do repositório (onde deve ficar `index.html`).
3. Mantenha `admin.html`, imagens, SVGs, `recipes.json`, `supabase-production.sql` e `.nojekyll` no mesmo nível.
4. Não envie senhas, tokens ou a chave `service_role` ao GitHub.

## 2. Criar o banco Supabase
1. Abra o projeto no Supabase Dashboard.
2. Vá a **SQL Editor → New query**.
3. Abra `supabase-production.sql`, copie todo o conteúdo e execute.
4. Em **Project Settings → API** (ou **Connect**), copie a **Project URL** e a chave pública **publishable/anon**.
5. Nunca use a chave `service_role` no navegador.

## 3. Configuração pública do frontend
1. Copie `supabase-config.example.js` para `supabase-config.js`.
2. Preencha `url` e `anonKey` com os valores do seu projeto.
3. `supabase-config.js` contém apenas credenciais públicas, mas as permissões continuam dependendo de RLS.
4. A versão atual ainda não consome esse arquivo automaticamente; ele é o ponto de configuração para a etapa de integração do app.

## 4. Criar administrador
Depois de cadastrar sua conta pelo Supabase Auth e confirmar o e-mail, execute no SQL Editor, trocando o e-mail:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'SEU-EMAIL-AQUI');
```

Não use a senha de demonstração antiga como credencial de produção. Remova/neutralize o login administrativo embutido no HTML antes de tornar o painel público.

## 5. Ativar GitHub Pages
1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment**, selecione **Deploy from a branch**.
3. Selecione a branch principal (geralmente `main`) e a pasta `/ (root)`; clique **Save**.
4. Aguarde o endereço aparecer na mesma tela. Teste `index.html` e `admin.html`.
5. Cada atualização publicada no branch selecionado será publicada pelo Pages.

## 6. Configurar autenticação Supabase
Em **Authentication → URL Configuration**, defina:
- Site URL: o endereço exato do GitHub Pages, incluindo o caminho do repositório se for projeto (ex.: `https://USUARIO.github.io/NOME-REPO/`).
- Redirect URLs: adicione esse endereço e os caminhos usados no fluxo de autenticação.

## 7. O que ainda falta para produção
- Refatorar cadastro/login para Supabase Auth (hoje o HTML guarda senha em `localStorage`, inseguro para produção).
- Ler/escrever receitas, categorias e ingredientes no banco; migrar o catálogo atual.
- Mover fotos para Supabase Storage com políticas de acesso.
- Ligar curtidas, avaliações, comentários, seguidores, notificações e destaques às tabelas online.
- Garantir que o admin seja verificado por RLS e não por um `role` no navegador.
- Testar os fluxos em janela anônima e em dois dispositivos.

## Segurança
Nunca publique senhas reais nem `service_role`. A chave publicável/anon pode aparecer no frontend somente com RLS configurado e testado. Faça backup antes de executar SQL em projeto existente.
