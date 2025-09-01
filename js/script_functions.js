let filtroAtualDoces = 'Todos';

document.addEventListener('DOMContentLoaded', () => {
  renderizarCardapio();
  aplicarEventos();
});


// CONTROLES DO CARDÁRPIO =========================================================================
const itensSelecionados = new Map(); // Armazena os itens selecionados com dados completos

function renderizarCardapio() {
  for (const categoria in cardapioData) {
    const lista = document.getElementById(`lista-${categoria}`);

    cardapioData[categoria].forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      const itemId = item.descricao;
      const precoUnitario = item.valor;
      const quantidadeSalva = itensSelecionados.get(itemId)?.quant;
      const quantidadeInicial = quantidadeSalva || 1;
      const valorTotalInicial = precoUnitario * quantidadeInicial;

      let conteudo = `
        <img src="${item.imagem}" alt="${item.descricao}" 
             onerror="this.onerror=null;this.src='img/sem-imagem.jpg';">
        <div class="card-info">
          <div class="descricao">${item.descricao}</div>
          <input type="checkbox" class="card-checkbox" data-id="${itemId}" ${itensSelecionados.has(itemId) ? 'checked' : ''}>
      `;

      if (categoria === 'doces' || categoria === 'doces_cento') {
        conteudo += `
          <div class="preco">${item.preco}</div>
          <hr>
          <div id="area-qtd">
            <label>Qtd:
              <input type="number" class="quantidade-input" data-id="${itemId}" value="${quantidadeInicial}" min="1" step="1">
          </div>
          <div id="area-total-item">
            <label>Total:</label>
            <p class="valor-total-item" id="valor-${itemId}">
              R$ ${valorTotalInicial.toFixed(2).replace('.', ',')}
            </p>
          </div>`;
      } else {
        conteudo += `
          <div class="massa">${item.massa}</div>
          <div class="preco">${item.preco_kg}</div>
          <hr>
          <div id="area-qtd">
            <label>Qtd:
              <input type="number" class="quantidade-input" data-id="${itemId}" value="${quantidadeInicial}" min="1" step="0.1">
              <label>Kg</label>
          </div>
          <div id="area-total-item">
            <label>Total:</label>
            <p class="valor-total-item" id="valor-${itemId}">
              R$ ${valorTotalInicial.toFixed(2).replace('.', ',')}
            </p>
          </div>`;
      }

      conteudo += `</div>`;
      card.innerHTML = conteudo;
      lista.appendChild(card);
    });
  }

  inicializarCategorias(); // aplica listeners depois que tudo foi renderizado
}

// Depois que renderizar o cardápio
function inicializarCategorias() {
  const menu = document.querySelector('.menu');
  const botoes = Array.from(document.querySelectorAll('.btn-categoria'));
  const secoes = Array.from(document.querySelectorAll('main .categoria')); // <section id="...">
  const botaoPorId = new Map(
    botoes.map(btn => [btn.getAttribute('href').replace('#', ''), btn])
  );

  // aplica classe ativo no botão correspondente ao id
  function setAtivo(id) {
    botoes.forEach(b => b.classList.remove('ativo'));
    const btn = botaoPorId.get(id);
    if (btn) btn.classList.add('ativo');
  }

  // clique: já marca ativo (além do scroll)
  botoes.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('href').replace('#', '');
      setAtivo(id);
    });
  });

  // cálculo do offset por causa do menu fixo/sticky
  const offset = (menu?.offsetHeight || 0) + 10;

  // scroll: identifica qual seção está "no topo útil" da viewport
  function onScroll() {
    let atual = secoes[0]?.id; // fallback
    for (const sec of secoes) {
      const rect = sec.getBoundingClientRect();
      // quando o topo da seção cruzar a linha (offset), ela vira a atual
      if (rect.top - offset <= 0) {
        atual = sec.id;
      }
    }
    setAtivo(atual);
  }

  // ativa o primeiro botão no load
  if (botoes.length) setAtivo(secoes[0]?.id);

  // escuta o scroll (passive p/ performance) e dispara 1x no início
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
aplicarEventos();

function aplicarEventos() {
  // Inputs de quantidade
  console.log('eventos chamados...')
  document.querySelectorAll('.quantidade-input').forEach(input => {
    const id = input.dataset.id;
    const item = Object.values(cardapioData).flat().find(i => i.descricao === id);

    function salvarQuantidade(quantidade) {
      const existente = itensSelecionados.get(id);
      if (existente) {
        itensSelecionados.set(id, { ...existente, quant: quantidade });
      } else {
        itensSelecionados.set(id, { ...item, quant: quantidade });
      }
    }

    input.addEventListener('input', (e) => {
      let quantidade = parseFloat(e.target.value);
      if (isNaN(quantidade)) return;

      const total = item.valor * quantidade;
      document.getElementById(`valor-${id}`).textContent =
        `R$ ${total.toFixed(2).replace('.', ',')}`;

      salvarQuantidade(quantidade);
    });

    input.addEventListener('blur', (e) => {
      let quantidade = parseFloat(e.target.value);
      if (isNaN(quantidade) || quantidade < 1) {
        quantidade = 1;
        e.target.value = quantidade;
      }
      const total = item.valor * quantidade;
      document.getElementById(`valor-${id}`).textContent =
        `R$ ${total.toFixed(2).replace('.', ',')}`;
      salvarQuantidade(quantidade);
    });
  });

  // Checkboxes
  document.querySelectorAll('.card-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const item = Object.values(cardapioData).flat().find(i => i.descricao === id);

      if (e.target.checked) {
        const quantidadeInput = document.querySelector(`.quantidade-input[data-id="${id}"]`);
        const quantidade = parseFloat(quantidadeInput?.value) || 1;
        itensSelecionados.set(id, { ...item, quant: quantidade });
      } else {
        itensSelecionados.delete(id);
      }
      atualizarContadorCarrinho();
    });
  });
}


// Atualiza o contador no carrinho
function atualizarContadorCarrinho() {
  console.log('Contador chamados...')
  const contador = document.getElementById('notificacao-carrinho');
  const botaoCarrinho = document.getElementById('btn-carrinho');

  const totalSelecionados = itensSelecionados.size;
  contador.textContent = totalSelecionados;

  botaoCarrinho.disabled = totalSelecionados === 0;
}

// Botão do carrinho: salva itens e redireciona
document.getElementById('btn-carrinho').addEventListener('click', () => {
  const itensParaCheckout = [];

  itensSelecionados.forEach((itemSelecionado) => {
    const quantidade = itemSelecionado.quant || 1;
    const valorTotal = itemSelecionado.valor * quantidade;

    itensParaCheckout.push({
      ...itemSelecionado,
      valorTotal,
    });
  });


    localStorage.setItem('itensCheckout', JSON.stringify(itensParaCheckout));
    window.location.href = 'checkout.html';
  });
