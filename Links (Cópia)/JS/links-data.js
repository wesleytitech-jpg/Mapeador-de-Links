
/*
 * =====================  COMO EDITAR  =====================
 *
 * ADICIONAR UM SITE
 *   Dentro da secao desejada, procure o bloco  links: [ ... ]
 *   e adicione uma linha NOVA no final da lista (com virgula
 *   depois do item anterior):
 *
 *     { title: 'Nome do site', url: 'https://site.com', tags: 'palavras de busca', icon: 'arquivo.png' },
 *
 * CRIAR UMA SECAO
 *   Copie um bloco  { title: ..., links: [ ... ] }
 *   inteiro, cole depois da virgula da secao anterior e troque
 *   o titulo e os links.
 *
 * CAMPOS DE CADA LINK
 *   title : nome exibido                              (obrigatorio)
 *   url   : endereco completo, com https://          (obrigatorio)
 *   tags  : palavras extras para a busca              (opcional)
 *   icon  : nome do arquivo dentro da pasta imagens/  (opcional)
 *   novo  : data 'AAAA-MM-DD'; mostra o selo NOVO por 7 dias (opcional)
 *
 * CAMPOS DE CADA SECAO
 *   title       : nome da secao
 *
 * TEMA  (campo  theme  logo abaixo)
 *   1 = CMD classico (cinza no preto)
 *   2 = Terminal verde
 *   3 = Ambar (monitor retro)
 *   4 = PowerShell (azul)
 *   5 = Claro
 *
 * REGRAS DE OURO
 *   - Textos entre aspas simples '...'. Se o texto tiver aspas
 *     simples dentro, use \' (ex.: 'D\'agua').
 *   - Todo item termina com virgula, menos o ultimo da lista.
 *   - Depois de editar, salve (Ctrl+S) e atualize a pagina (F5).
 *   - Atualize o campo lastUpdate abaixo (AAAA-MM-DD).
 * ========================================================
 */
window.LINKS_DATA = {
    theme: 1,
    creator: 'Wesley Gomes',
    lastUpdate: '2026-10-14',
    sections: [

        /* ---------- SECAO 1: LENOVO ---------- */
        {
            title: 'Lenovo',
            links: [
                { title: 'Marcacao de Ponto', url: '', tags: 'ponto rh frequencia', icon: 'lenovo.png' },
                { title: 'Workday Lenovo', url: 'https://wd1-identity.myworkday.com/wday/authgwy/lenovo/upc/login?redirect=n', tags: 'workday grow rh recursos humanos', icon: 'lenovo.png' },
                { title: 'Treinamento de Seguranca', url: 'https://www.myworkday.com/lenovo/learning/course/f69a5bf4b6bd1000302c4f8a054b0000?type=9882927d138b100019b928e75843018d&record=90991cc300bd100206a48d910a0b0000', tags: 'workday seguranca treinamento', icon: 'lenovo.png' },
            ]
        }
    ]
};
