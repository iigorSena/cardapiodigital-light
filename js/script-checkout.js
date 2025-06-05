// Controle de exibição dos cards =============================================================
let itens = JSON.parse(localStorage.getItem('itensCheckout')) || [];

document.addEventListener('DOMContentLoaded', () => {
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
  const areaCheckout = document.createElement('div');
  areaCheckout.className = 'area-checkout';

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
      areaCheckout.appendChild(card); // Anexa o card à área

      if (item.massa) {
          const divRecheios = document.createElement('div');
          divRecheios.className = 'recheios';
          divRecheios.innerHTML = `
            <p><strong>Escolha 2 recheios</strong></p>
            <div class="recheios-scroll">
              <table class="tabela-recheios">
                ${[...RECHEIOS_GRATIS.map(recheio => `
                  <tr>
                    <td><label><input type="checkbox" class="check-recheio" data-index="${index}" data-nome="${recheio}" data-valor="0" ${item.recheiosExtras?.some(r => r.nome === recheio) ? 'checked' : ''}> ${recheio}</label></td>
                    <td>R$ 0,00</td>
                  </tr>
                `), ...RECHEIOS_PAGOS.map(recheio => `
                  <tr>
                    <td><label><input type="checkbox" class="check-recheio" data-index="${index}" data-nome="${recheio.nome}" data-valor="${recheio.valor}" ${item.recheiosExtras?.some(r => r.nome === recheio.nome) ? 'checked' : ''}> ${recheio.nome}</label></td>
                    <td>R$ ${recheio.valor.toFixed(2).replace('.', ',')}</td>
                  </tr>
                `)].join('')}
              </table>
            </div>
          `;
        areaCheckout.appendChild(divRecheios);
      }

      container.appendChild(areaCheckout);
      totalCentavos += Math.round(item.valorTotal * 100);
    }); // <-- fechamento correto do forEach aqui

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
        atualizarCheckout();
      });
    });

// Checkbox de recheios
  document.querySelectorAll('.check-recheio').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const index = parseInt(checkbox.dataset.index);
      const valor = parseFloat(checkbox.dataset.valor);
      const nome = checkbox.dataset.nome;

      if (!itens[index].recheiosExtras) itens[index].recheiosExtras = [];

      // Limitar o total de recheios (gratuitos ou pagos) a no máximo 2
      const recheiosSelecionados = itens[index].recheiosExtras;

      if (checkbox.checked && recheiosSelecionados.length >= 2) {
        checkbox.checked = false;
        alert('Você só pode selecionar até 2 recheios.');
        return;
      }

      if (checkbox.checked) {
        recheiosSelecionados.push({ nome, valor });
      } else {
        itens[index].recheiosExtras = recheiosSelecionados.filter(r => r.nome !== nome);
      }

      const extraTotal = itens[index].recheiosExtras.reduce((sum, r) => sum + r.valor, 0);
      itens[index].valorTotalOriginal = itens[index].valorTotalOriginal || itens[index].valorTotal;
      itens[index].valorTotal = itens[index].valorTotalOriginal + extraTotal;

      localStorage.setItem('itensCheckout', JSON.stringify(itens));
      atualizarCheckout();
    });
  });

  }

  atualizarCheckout();
});

// Botão de Enviar Pedido ==================================================================
document.addEventListener('DOMContentLoaded', () => {
  const btnEnviar = document.getElementById('btn-enviar-pedido');

  if (btnEnviar) {
  btnEnviar.addEventListener('click', () => {
  const itens = JSON.parse(localStorage.getItem('itensCheckout')) || [];
  let mensagem = '*Pedido Lia Bolos Decorados*%0A%0A';
  let totalCentavos = 0;

  // Recalcular total com recheios
  itens.forEach(item => {
    if (item.recheiosExtras) {
      const extraTotal = item.recheiosExtras.reduce((sum, r) => sum + r.valor, 0);
      item.valorTotalOriginal = item.valorTotalOriginal || (item.valorTotal - extraTotal);
      item.valorTotal = item.valorTotalOriginal + extraTotal;
    }
  });

  itens.forEach((item, index) => {
    mensagem += `*${index + 1}.* ${item.descricao}%0A`;

    if (item.massa) {
      if (item.recheiosExtras && item.recheiosExtras.length > 0) {
        mensagem += `• Recheios escolhidos:%0A`;
        item.recheiosExtras.forEach(r => {
          mensagem += `  - ${r.nome}: R$ ${r.valor.toFixed(2).replace('.', ',')}%0A`;
        });
      } else {
        mensagem += `• Recheios escolhidos: Não informado%0A`;
      }
    }

    const valorItem = item.valorTotal || 0;
    const valorItemFormatado = valorItem.toFixed(2).replace('.', ',');

    mensagem += `• Quantidade: ${item.quant}${item.massa ? ' kg' : ''}%0A`;
    mensagem += `• Valor do item: R$ ${valorItemFormatado}%0A%0A`;


    totalCentavos += Math.round(valorItem * 100);
  });

  const totalReais = (totalCentavos / 100).toFixed(2).replace('.', ',');

  mensagem += `*Valor total:* R$ ${totalReais}%0A`;
  mensagem += `%0A Gostaria de confirmar meu pedido.`;

  const telefone = '5598992278315';
  const url = `https://wa.me/${telefone}?text=${mensagem}`;
  window.open(url, '_blank');
 }); // fecha o addEventListener
  } // ✅ <-- esta chave estava faltando
});