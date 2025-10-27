# Deploy no EasyPanel (React + Vite)

Este projeto está pronto para deploy no **EasyPanel** usando **Dockerfile** e **Nginx** para servir os arquivos estáticos gerados pelo Vite.

## O que foi configurado
- `Dockerfile` multi-stage: compila o projeto com Node e serve com Nginx.
- `nginx.conf`: fallback de SPA para `index.html` (compatível com `react-router-dom`).
- `.dockerignore`: reduz o contexto de build do Docker.
- `vite.config.ts`: gera build em `out/` e aceita `BASE_PATH` via env.

## Passos de Deploy no EasyPanel

1. No EasyPanel, crie uma **Nova Aplicação** do tipo **Dockerfile App**.
2. Aponte para o repositório que contém este projeto (ou faça upload do código).
3. Não é necessário configurar comandos; o Dockerfile já define tudo.
4. **Porta interna**: `80` (o Nginx expõe 80). O EasyPanel mapeará para a porta externa automática.
5. **Domínio**: adicione seu domínio/subdomínio à aplicação (opcionalmente habilite HTTPS).
6. **Variáveis/Args (opcional)**:
   - `BASE_PATH`: ajuste o caminho base do app (ex.: `/` por padrão, ou `/app` se servir sob subpath).
   - Este valor é aplicado **no build**; se precisar, configure como **Build Arg** no EasyPanel.
7. Clique em **Deploy**. O EasyPanel fará o build da imagem e subirá o container com Nginx.

## Build local (opcional)
```bash
npm install
npm run build
```
A saída ficará em `out/`. Você pode testar com:
```bash
npm run preview
```

## Observações
- Se o app for servido em subcaminho (ex.: `https://dominio.com/app`), configure `BASE_PATH=/app` antes do build.
- `nginx.conf` já está preparado para SPA: rotas não encontradas como arquivo físico caem em `index.html`.
- Não há necessidade de `start` script; o Nginx cuida do servidor de produção.

## Estrutura relevante
- `Dockerfile`: build + Nginx.
- `nginx.conf`: fallback de SPA.
- `.dockerignore`: otimizações de build.
- `vite.config.ts`: saída em `out/` e suporte a `BASE_PATH`.