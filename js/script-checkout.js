document.addEventListener('DOMContentLoaded', () => {
  let itens = JSON.parse(localStorage.getItem('itensCheckout')) || [];
  const container = document.getElementById('checkout');

  function atualizarCheckout() {
    container.innerHTML = '';
    let totalCentavos = 0;

  if (itens.length === 0) {
      container.innerHTML = '<p>Nenhum item selecionado.</p>';
      document.getElementById('valor-total-fixo').innerHTML = '';
      return;
  }

  itens.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card-checkout';

  let conteudo = `
    <img src="${item.imagem}" alt="${item.descricao}">
    <div class="card-info">
      <div class="descricao">${item.descricao}</div>
  `;

  if (item.massa) {
    conteudo += `
      <div class="massa">${item.massa}</div>
      <hr>
      <div class="quantidade">Qtd: ${item.quant} kg</div>
      <div class="preco">Total: R$ ${item.valorTotal.toFixed(2).replace('.', ',')}</div>`;
  } else {
    conteudo += `
      <hr>
      <div class="quantidade">Qtd: ${item.quant}</div>
      <div class="preco">Total: R$ ${item.valorTotal.toFixed(2).replace('.', ',')}</div>`;
  }

  conteudo += `
    </div> <!-- Fecha .card-info -->
    <div id="area-btn-remover">
      <button class="btn-remove">
        <img src="img/lixeira.png" alt="Remover" data-index="${index}">
      </button>
    </div>`;


  card.innerHTML = conteudo;
  container.appendChild(card);
  totalCentavos += Math.round(item.valorTotal * 100);
  });

  const totalReais = (totalCentavos / 100).toFixed(2).replace('.', ',');
    const totalFixo = document.getElementById('valor-total-fixo');
    totalFixo.innerHTML = `<strong>Valor total: R$ ${totalReais}</strong>`;

    // Botões de remoção
    const botoesRemover = document.querySelectorAll('.btn-remove');
    botoesRemover.forEach(botao => {
      botao.addEventListener('click', () => {
        const index = parseInt(botao.dataset.index);
        itens.splice(index, 1);
        localStorage.setItem('itensCheckout', JSON.stringify(itens));
        atualizarCheckout(); // Re-renderiza
      });
    });
  }
  
  atualizarCheckout(); // Chama ao carregar a página
});

// Botão de Enviar Pedido ==================================================================
document.addEventListener('DOMContentLoaded', () => {
  const btnEnviar = document.getElementById('btn-enviar-pedido');
  const itens = JSON.parse(localStorage.getItem('itensCheckout')) || [];

  if (btnEnviar) {
    btnEnviar.addEventListener('click', () => {
      let mensagem = '*Pedido Lia Bolos Decorados*%0A%0A';
      let totalCentavos = 0;

      itens.forEach((item, index) => {
        mensagem += `*${index + 1}.* ${item.descricao}%0A`;

        if (item.massa) {
          mensagem += `• Massa: ${item.massa}%0A`;
        }

        mensagem += `• Quantidade: ${item.quant}%0A`;

        // Calcula valor total individual
        const valorItem = item.valorTotal || 0;
        const valorItemFormatado = (valorItem).toFixed(2).replace('.', ',');

        mensagem += `• Valor do item: R$ ${valorItemFormatado}%0A%0A`;

        totalCentavos += Math.round(valorItem * 100);
      });

      const totalReais = (totalCentavos / 100).toFixed(2).replace('.', ',');

      mensagem += `*Valor total:* R$ ${totalReais}%0A`;
      mensagem += `%0A Gostaria de confirmar meu pedido.`;

      const telefone = '5598982663835';
      const url = `https://wa.me/${telefone}?text=${mensagem}`;
      window.open(url, '_blank');
    });
  }
});
