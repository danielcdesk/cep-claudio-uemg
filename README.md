# CEP Cláudio

Landing page acadêmica para pesquisar os logradouros e CEPs retornados pela API ViaCEP nas consultas de Rua, Avenida e Praça para Cláudio (MG). O projeto usa HTML5 semântico, CSS3 e JavaScript puro, sem frameworks ou bibliotecas.

**Página publicada:** https://danielcdesk.github.io/cep-claudio-uemg/  
**Repositório:** https://github.com/danielcdesk/cep-claudio-uemg

## Como funciona

1. A pasta `data/` contém as três respostas da API consolidadas em `ceps.json`.
2. A página carrega o JSON com `fetch()` e procura os registros localmente no navegador.
3. As sugestões aparecem a partir de três caracteres. A busca ignora diferenças entre maiúsculas, minúsculas e acentos.
4. Cada resultado mostra logradouro, bairro, localidade, UF e CEP. O botão “Copiar” envia o CEP escolhido à área de transferência.

## Base de dados

As consultas foram feitas em **18 de novembro de 2026**. Foram recebidos sete registros: quatro na consulta de Rua, dois na consulta de Avenida e um na consulta de Praça. Após deduplicação, o arquivo reúne sete registros únicos, dos quais seis têm nome de logradouro.

A consulta de Praça retornou um CEP geral sem nome de via. Esse registro foi preservado no JSON e contabilizado, mas não é oferecido como sugestão de logradouro. A busca não mistura CEPs gerais de outras fontes com CEPs individuais e não completa dados que a API não retornou.

### Endpoints consultados

- [Rua](https://viacep.com.br/ws/MG/Cl%C3%A1udio/Rua/json/)
- [Avenida](https://viacep.com.br/ws/MG/Cl%C3%A1udio/Avenida/json/)
- [Praça](https://viacep.com.br/ws/MG/Cl%C3%A1udio/Praca/json/)

O arquivo registra a data, as URLs, a quantidade retornada por consulta e os campos usados na busca. A deduplicação considera CEP, logradouro, bairro, localidade, UF e complemento; quando um registro coincidir entre categorias, as categorias são reunidas.

Os CEPs são apresentados com base no retorno estático do ViaCEP consultado nessa data. A aplicação não consulta os Correios em tempo real. Confirme informações importantes nos canais oficiais.

## Estrutura

```text
cep-claudio-uemg/
├── assets/
│   ├── claudio-praca.jpg
│   ├── logo-sistemas-uemg-carangola.png
│   └── logo-uemg-carangola.png
├── css/
│   └── styles.css
├── data/
│   └── ceps.json
├── docs/
│   └── linkedin-post.md
├── js/
│   └── app.js
├── index.html
└── README.md
```

## Abrir localmente

Como a página carrega JSON via `fetch()`, abra-a por um servidor HTTP, não diretamente por `file://`.

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Publicação no GitHub Pages

O projeto está configurado para ser servido pela raiz do repositório na branch `main`. Confira a página publicada e confirme que `data/ceps.json` carrega junto com a interface.

Os caminhos para CSS, JavaScript, imagens e JSON são relativos, inclusive para publicação em endereço de projeto do GitHub Pages.

## Imagem e identidade visual

- Foto da praça principal: Bruno Carvalho Leal, disponibilizada em [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pra%C3%A7a_principal_de_Cl%C3%A1udio_-_MG_-_panoramio.jpg). O crédito também aparece junto à imagem na página.
- Logos da UEMG Carangola e do curso de Sistemas de Informação: arquivos enviados pela equipe para esta atividade.
- A interface usa fontes do sistema, sem carregar fontes de terceiros.

## Autoria e transparência

**Equipe:** Daniel Cirilo de Souza, Robertt Avelino da Silva e Emanuel Santos Cunha.

Links para os perfis pessoais estão disponíveis no modal “Sobre”. Ferramentas de IA generativa apoiaram a organização e elaboração desta versão. A equipe deve revisar, compreender e validar o código e o conteúdo antes da apresentação.

O projeto foi desenvolvido como atividade prática do curso de Bacharelado em Sistemas de Informação da Universidade do Estado de Minas Gerais, Unidade Acadêmica de Carangola.

## Divulgação

Um rascunho para a publicação técnica no LinkedIn está em [`docs/linkedin-post.md`](docs/linkedin-post.md). Complete os links e anexe uma demonstração visual antes de publicar. A equipe deve marcar os integrantes na própria publicação.
