# Sistema de Gestao Interna FJ Grafica e Papelaria - POC

POC academica criada a partir do PDF `Projeto_ Sistema de Gestao Interna (MVP).pdf`, sem alterar o arquivo original.

## Stack do PDF

- Node.js
- Express.js
- EJS
- Bootstrap
- express-session
- bcrypt

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Usuarios seed

- Gestor: `gestor` / `123456`
- Vendedor Externo: `vendedor` / `123456`

## Escopo implementado

- Login com sessao e senha com hash bcrypt.
- Dashboard gerencial com filtro por periodo.
- CRUD de pedidos com calculo automatico de Lucro Liquido Real.
- Comissao do vendedor calculada sobre lucro liquido, com trava em zero quando ha prejuizo.
- Lancamentos financeiros manuais para gestor.
- Upload local de documentos com regra XOR: pedido OU lancamento manual.
- Download de documento autenticado.
- Schema SQL MySQL/MariaDB baseado no dicionario de dados do PDF.
- Testes do motor de lucro conforme a matriz de cenarios do PDF.

## Testes

```bash
npm test
```
