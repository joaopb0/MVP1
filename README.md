# POC MVP1 - Sistema de Gestao Interna FJ Grafica e Papelaria

Este repositorio contem uma Prova de Conceito academica do MVP1 do Sistema de Gestao Interna da FJ Grafica e Papelaria. O objetivo e validar, de forma enxuta, o fluxo central de gestao de pedidos com apuracao financeira real por pedido.

## Escopo validado

Fluxo central da POC: Pedido -> Custos/Taxas -> Lucro Liquido Real -> Comissao -> Documentos -> Dashboard.

A POC cobre cadastro e listagem de pedidos, calculo do Lucro Liquido Real, calculo de comissao com trava para `LL <= 0`, vinculo simples de documentos fiscais ou comprovantes e uma visao gerencial com faturamento, lucro, comissoes e pedidos com ou sem prejuizo.

## Tecnologias

- Node.js
- Express
- EJS
- Bootstrap
- SQLite local via `node:sqlite`

O documento academico cita MySQL/MariaDB como possibilidade futura. Nesta POC foi mantido SQLite por simplicidade de instalacao, execucao local e defesa do fluxo principal, sem migracao definitiva de banco neste momento.

## Fora do escopo da POC

Migracao definitiva de banco, conciliacao bancaria, integracao fiscal automatica, emissao de nota fiscal, aplicativo mobile nativo, relatorios avancados e automacoes complexas ficam como evolucoes futuras.

O repositorio `joaopb0/FJ` serviu apenas como referencia tecnica e visual para organizacao Express/EJS, autenticacao, uploads e navegacao. Este MVP1 e uma versao reduzida para validacao academica, nao uma copia do sistema completo.

## Como rodar

```bash
npm install
npm start
```

Acesse `http://localhost:3000`.
Requer Node.js `>=22.5.0`, pois a POC usa o modulo nativo `node:sqlite`.

Usuarios seed:

- Gestor: `gestor` / `123456`
- Vendedor: `vendedor` / `123456`

## Teste do motor de lucro

```bash
npm run test:lucro
```

## About sugerido para o GitHub

POC do MVP1 do Sistema de Gestao Interna da FJ Grafica e Papelaria, focada em pedidos, custos, lucro liquido real, comissoes, documentos e visao gerencial em Node.js, Express, EJS e SQLite.
