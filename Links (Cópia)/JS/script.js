(function () {
    'use strict';

    var DAY = 864e5;
    var data = window.LINKS_DATA || { sections: [] };

    var listed = false;      // tela em branco ate o primeiro ls
    var showing = false;     // ha algo na tela (listagem ou resultado de pesquisa)
    var cdTerm = '';         // filtro de secao (comando cd)
    var query = '';          // pesquisa ao vivo
    var sel = 0;             // link destacado
    var expanded = {};       // guias abertas (por padrao todas fechadas)
    var anchors = [];
    var topLinks = computeTop();

    function $(id) { return document.getElementById(id); }
    function el(tag, cls, txt) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt != null) e.textContent = txt;
        return e;
    }
    function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    function fmt(s) {
        var p = (s || '').split('-');
        return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '--';
    }
    function isNew(s) {
        if (!s) return false;
        var t = new Date(s + 'T00:00:00').getTime();
        return !isNaN(t) && Date.now() - t < 7 * DAY;
    }
    function firstWord(s) { return norm(s.trim().split(/\s+/)[0]); }
    // so e comando se for exatamente a palavra (ls, dir, cls...) ou cd/tema com argumento.
    // Qualquer outro texto, mesmo comecando com "help" ou "reset", e pesquisa normal.
    var EXACT = ['ls', 'dir', 'ajuda', 'help', '?', 'cls', 'limpar', 'clear', 'reset'];
    function isCommand(s) {
        var t = norm(s).trim();
        return EXACT.indexOf(t) > -1 || /^(cd|tema|theme)(\s|$)/.test(t);
    }
    function match(l, term) {
        if (!term) return true;
        var hay = norm(l.title + ' ' + l.url + ' ' + (l.tags || ''));
        return norm(term).split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
    }

    /* ---------- cliques (dos) ---------- */
    function getClicks() {
        try { return JSON.parse(localStorage.getItem('clicks') || '{}'); } catch (e) { return {}; }
    }
    function addClick(url) {
        var c = getClicks();
        c[url] = (c[url] || 0) + 1;
        try { localStorage.setItem('clicks', JSON.stringify(c)); } catch (e) {}
    }
    function computeTop() {
        var c = getClicks(), all = [];
        (data.sections || []).forEach(function (s) {
            (s.links || []).forEach(function (l) { if (c[l.url] > 0) all.push({ l: l, n: c[l.url] }); });
        });
        all.sort(function (a, b) { return b.n - a.n; });
        return all.slice(0, 5).map(function (x) { return x.l; });
    }
    function openLink(url) {
        addClick(url);
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    /* ---------- saida de comandos (#out) ---------- */
    function showOut(lines) {
        var out = $('out');
        out.textContent = lines ? lines.join('\n') : '';
        out.hidden = !lines;
        refreshApp();
    }
    function refreshApp() {
        $('app').hidden = !(showing || !$('out').hidden);
    }

    /* ---------- listagem ---------- */
    function sectionBlock(title, links, key, term) {
        var hidden = !term && !expanded[key];
        var sec = el('section', 'section' + (hidden ? ' collapsed' : ''));
        var t = el('button', 'sec-title', title);
        t.type = 'button';
        t.setAttribute('aria-expanded', String(!hidden));
        t.onclick = function () { expanded[key] = !expanded[key]; render(); };
        sec.appendChild(t);
        if (hidden) return sec;

        var grid = el('div', 'links');
        links.forEach(function (l) {
            var row = el('div', 'link-row');
            var a = el('a');
            a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
            if (l.icon) {
                var img = el('img');
                img.src = 'imagens/' + l.icon; img.alt = '';
                img.onerror = function () { img.remove(); };
                a.appendChild(img);
            }
            a.appendChild(el('span', 'txt', l.title));
            if (isNew(l.novo)) a.appendChild(el('span', 'badge', '<NOVO>'));
            a.addEventListener('click', function () { addClick(l.url); });
            row.appendChild(a);
            grid.appendChild(row);
            anchors.push({ a: a, url: l.url });
        });
        sec.appendChild(grid);
        return sec;
    }

    function render() {
        var box = $('container');
        box.textContent = '';
        anchors = [];
        $('emptyMsg').hidden = true;
        $('summary').textContent = '';

        var term = isCommand(query) ? '' : query.trim();
        var cdMatch = null;
        $('promptLabel').textContent = 'C:\\Links>';

        if (!listed && !term) { showing = false; refreshApp(); return; }
        showing = true;

        var folders = 0, files = 0;
        if (cdTerm) {
            data.sections.forEach(function (s) { if (!cdMatch && norm(s.title).indexOf(norm(cdTerm)) > -1) cdMatch = s; });
            if (cdMatch) $('promptLabel').textContent = 'C:\\Links\\' + cdMatch.title + '>';
        }

        data.sections.forEach(function (s) {
            if (cdTerm && s !== cdMatch) return;
            var links = (s.links || []).filter(function (l) { return match(l, term); });
            if (term && !links.length) return;
            box.appendChild(sectionBlock(s.title, links, s.title, term));
            folders++; files += links.length;
        });

        if (term && !files) {
            var m = $('emptyMsg');
            m.textContent = "Nenhum link encontrado para '" + term + "'.";
            m.hidden = false;
        }
        if (sel >= anchors.length) sel = 0;
        if (term && anchors[sel]) anchors[sel].a.classList.add('sel');
        $('summary').textContent = files + ' arquivo(s)   ' + folders + ' pasta(s)';
        refreshApp();
    }

    /* ---------- tema ---------- */
    function setTheme(n) {
        document.documentElement.dataset.theme = n;
        try { localStorage.setItem('theme', n); } catch (e) {}
    }

    /* ---------- comandos ---------- */
    function run(raw) {
        var parts = raw.trim().split(/\s+/);
        var name = firstWord(raw);
        var arg = parts.slice(1).join(' ');
        showOut(null);

        if (name === 'ls' || name === 'dir') {
            // ls alterna: mostra tudo (guias abertas); digitar ls de novo oculta tudo
            expanded = {}; cdTerm = '';
            if (listed) {
                listed = false;
            } else {
                listed = true;
                expanded.__top = true;
                data.sections.forEach(function (s) { expanded[s.title] = true; });
            }
        } else if (name === 'cd') {
            if (!arg || arg === '..') { cdTerm = ''; listed = true; }
            else {
                var ok = data.sections.some(function (s) { return norm(s.title).indexOf(norm(arg)) > -1; });
                if (ok) {
                    cdTerm = arg; listed = true;
                    data.sections.forEach(function (s) { if (norm(s.title).indexOf(norm(arg)) > -1) expanded[s.title] = true; });
                }
                else showOut(['O sistema nao pode encontrar o caminho especificado.']);
            }
        } else if (name === 'cls' || name === 'limpar' || name === 'clear') {
            listed = false; expanded = {}; cdTerm = ''; showOut(null);
        } else if (name === 'tema' || name === 'theme') {
            if (/^[1-5]$/.test(arg)) { setTheme(arg); showOut(['Tema ' + arg + ' aplicado.']); }
            else showOut(['Uso: tema 1 a 5']);
        } else {
            showOut([
                'ls [dir]     mostra as guias e links (ls de novo oculta)',
                'cd <secao>   mostra so uma secao (cd .. volta)',
                'tema 1 a 5   troca o tema (ou digite so o numero)',
                'cls          oculta tudo e limpa a tela',
                'ajuda        mostra esta lista',
                '',
                'Digite para pesquisar; Enter abre o primeiro resultado.'
            ]);
        }
        render();
    }

    /* ---------- prompt ---------- */
    var input = $('searchInput');
    var typed = $('typed');
    var hint = $('hint');

    function syncTyped() {
        typed.textContent = input.value;
        hint.hidden = input.value !== '';
    }

    input.addEventListener('input', function () {
        var v = input.value;
        if (/^[1-5]$/.test(v.trim())) {
            setTheme(v.trim());
            input.value = '';
            v = '';
        }
        // "ls" age na hora, sem precisar de Enter (alterna mostrar/ocultar)
        if (v.trim().toLowerCase() === 'ls') {
            run('ls');
            input.value = '';
            v = '';
        }
        query = v;
        sel = 0;
        syncTyped();
        render();
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            var v = input.value.trim();
            if (!v) return;
            if (isCommand(v) || (!listed && !anchors.length)) {
                run(v);
            } else if (anchors[sel]) {
                openLink(anchors[sel].url);
                return;
            } else {
                return;
            }
            input.value = ''; query = ''; syncTyped(); render();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (!anchors.length) return;
            e.preventDefault();
            sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + anchors.length) % anchors.length;
            render();
        } else if (e.key === 'Escape') {
            input.value = ''; query = ''; sel = 0; syncTyped(); render();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (document.activeElement === input) return;
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) input.focus();
    });
    document.querySelector('.screen').addEventListener('click', function (e) {
        if (!e.target.closest('a, button')) input.focus();
    });

    /* ---------- inicio ---------- */
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    setTheme(/^[1-5]$/.test(stored) ? stored : (/^[1-5]$/.test(String(data.theme)) ? String(data.theme) : '1'));
    // setTheme grava o valor: so persiste se o usuario escolheu
    if (!/^[1-5]$/.test(stored)) { try { localStorage.removeItem('theme'); } catch (e) {} }

    $('banner').textContent =
        'Microsoft Windows [Versao 10.0.22631.4317]\n' +
        '(c) Links Manager. Todos os direitos reservados.\n\n' +
        'Digite ajuda para ver todos os comandos.';
    hint.textContent = 'digite ls';
    $('lastUpdate').textContent = fmt(data.lastUpdate);
    $('creator').textContent = data.creator || '';
    syncTyped();
    input.focus();
    render();
})();
