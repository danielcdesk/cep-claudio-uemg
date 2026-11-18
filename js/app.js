const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#logradouro');
const suggestions = document.querySelector('#suggestions');
const suggestionStatus = document.querySelector('#suggestion-status');
const resultCount = document.querySelector('#result-count');
const results = document.querySelector('#results');
const emptyState = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyMessage = document.querySelector('#empty-message');
const dataNote = document.querySelector('#data-note');
const toast = document.querySelector('#toast');

let addresses = [];
let suggestionItems = [];
let activeSuggestion = -1;
let toastTimeout;
let lastDialogTrigger;

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function searchableAddresses(query) {
  const term = normalize(query);
  if (term.length < 3) return [];

  return addresses
    .filter((item) => item.logradouro && normalize(item.logradouro).includes(term))
    .sort((a, b) => {
      const prefixA = normalize(a.logradouro).startsWith(term) ? 0 : 1;
      const prefixB = normalize(b.logradouro).startsWith(term) ? 0 : 1;
      return prefixA - prefixB
        || a.logradouro.localeCompare(b.logradouro, 'pt-BR')
        || (a.bairro || '').localeCompare(b.bairro || '', 'pt-BR')
        || a.cep.localeCompare(b.cep, 'pt-BR');
    });
}

function hideSuggestions() {
  suggestions.hidden = true;
  searchInput.setAttribute('aria-expanded', 'false');
  searchInput.setAttribute('aria-activedescendant', '');
  activeSuggestion = -1;
  suggestionStatus.textContent = '';
}

function setActiveSuggestion(index) {
  const options = [...suggestions.querySelectorAll('[role="option"]')];
  if (!options.length) return;

  activeSuggestion = (index + options.length) % options.length;
  options.forEach((option, optionIndex) => {
    const selected = optionIndex === activeSuggestion;
    option.setAttribute('aria-selected', String(selected));
    option.classList.toggle('is-active', selected);
  });
  searchInput.setAttribute('aria-activedescendant', options[activeSuggestion].id);
  options[activeSuggestion].scrollIntoView({ block: 'nearest' });
}

function selectAddress(address) {
  searchInput.value = address.logradouro;
  hideSuggestions();
  renderResults([address], '1 endereço selecionado');
  document.querySelector('#lookup-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateSuggestions() {
  const query = searchInput.value;
  const normalizedLength = normalize(query).length;
  activeSuggestion = -1;
  suggestions.replaceChildren();
  results.replaceChildren();
  emptyState.hidden = false;
  suggestionItems = searchableAddresses(query);

  if (normalizedLength < 3) {
    hideSuggestions();
    suggestionStatus.textContent = 'Digite três ou mais letras para receber sugestões.';
    resultCount.textContent = `${addresses.filter((item) => item.logradouro).length} endereços disponíveis na base`;
    emptyTitle.textContent = query ? 'Continue escrevendo' : 'Comece por um endereço';
    emptyMessage.textContent = 'Digite pelo menos três letras para receber sugestões.';
    return;
  }

  suggestionItems.forEach((item, index) => {
    const option = document.createElement('li');
    option.id = `suggestion-${index}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    option.tabIndex = -1;

    const text = document.createElement('span');
    text.className = 'suggestion-address';
    const street = document.createElement('strong');
    street.textContent = item.logradouro;
    const district = document.createElement('small');
    district.textContent = item.bairro || 'Bairro não informado';
    text.append(street, district);

    const cep = document.createElement('span');
    cep.className = 'suggestion-cep';
    cep.textContent = item.cep;
    option.append(text, cep);

    option.addEventListener('pointerdown', (event) => event.preventDefault());
    option.addEventListener('click', () => selectAddress(item));
    suggestions.append(option);
  });

  suggestions.hidden = suggestionItems.length === 0;
  searchInput.setAttribute('aria-expanded', String(!suggestions.hidden));
  searchInput.setAttribute('aria-activedescendant', '');

  if (suggestionItems.length) {
    suggestionStatus.textContent = `${suggestionItems.length} ${suggestionItems.length === 1 ? 'sugestão encontrada' : 'sugestões encontradas'}. Use as setas e Enter para selecionar.`;
    resultCount.textContent = `${suggestionItems.length} correspondências`;
    emptyTitle.textContent = 'Selecione um endereço';
    emptyMessage.textContent = 'Use as setas e Enter ou escolha uma sugestão com o cursor.';
  } else {
    suggestionStatus.textContent = 'Nenhuma sugestão encontrada.';
    resultCount.textContent = 'Nenhuma correspondência';
    emptyTitle.textContent = 'Nenhum endereço encontrado';
    emptyMessage.textContent = 'Tente buscar outro trecho do nome do logradouro.';
  }
}

function createAddressCard(address) {
  const card = document.createElement('article');
  card.className = 'address-card';

  const category = document.createElement('p');
  category.className = 'address-category';
  category.textContent = address.categoriasConsulta?.join(' · ') || address.logradouro.split(' ')[0];

  const heading = document.createElement('h3');
  heading.textContent = address.logradouro;

  const district = document.createElement('p');
  district.className = 'address-district';
  district.textContent = address.bairro || 'Bairro não informado';

  const addressLine = document.createElement('p');
  addressLine.className = 'address-location';
  addressLine.textContent = `${address.localidade || 'Localidade não informada'} · ${address.uf || 'UF não informada'}`;

  card.append(category, heading, district, addressLine);

  if (address.complemento) {
    const complement = document.createElement('p');
    complement.className = 'address-complement';
    complement.textContent = address.complemento;
    card.append(complement);
  }

  const cepRow = document.createElement('div');
  cepRow.className = 'address-cep-row';
  const cepLabel = document.createElement('span');
  cepLabel.className = 'address-cep-label';
  cepLabel.textContent = 'CEP';
  const cep = document.createElement('strong');
  cep.className = 'address-cep';
  cep.textContent = address.cep || 'Não informado';

  const copy = document.createElement('button');
  copy.className = 'copy-button';
  copy.type = 'button';
  copy.textContent = 'Copiar';
  copy.setAttribute('aria-label', `Copiar CEP ${address.cep}`);
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address.cep);
      showToast(`CEP ${address.cep} copiado.`);
    } catch {
      showToast('Não foi possível copiar. Selecione o CEP para copiá-lo.');
    }
  });

  cepRow.append(cepLabel, cep, copy);
  card.append(cepRow);
  return card;
}

function renderResults(items, label = '') {
  results.replaceChildren();
  hideSuggestions();

  if (!items.length) {
    emptyState.hidden = false;
    emptyTitle.textContent = 'Nenhum endereço encontrado';
    emptyMessage.textContent = 'Tente buscar outro trecho do nome do logradouro.';
    resultCount.textContent = 'Nenhuma correspondência';
    return;
  }

  emptyState.hidden = true;
  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.append(createAddressCard(item)));
  results.append(fragment);
  resultCount.textContent = label || `${items.length} ${items.length === 1 ? 'endereço encontrado' : 'endereços encontrados'}`;
}

function submitSearch(event) {
  event.preventDefault();
  const query = searchInput.value;

  if (normalize(query).length < 3) {
    searchInput.focus();
    showToast('Digite pelo menos 3 letras para buscar.');
    return;
  }

  const matches = searchableAddresses(query);
  hideSuggestions();
  renderResults(matches);
}

function openDialog(button) {
  const dialog = document.getElementById(`dialog-${button.dataset.openDialog}`);
  if (!dialog) return;
  lastDialogTrigger = button;
  dialog.showModal();
}

searchInput.addEventListener('input', updateSuggestions);
searchInput.addEventListener('blur', () => {
  window.setTimeout(() => {
    if (!suggestions.contains(document.activeElement)) hideSuggestions();
  }, 0);
});
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' && !suggestions.hidden) {
    event.preventDefault();
    setActiveSuggestion(activeSuggestion + 1);
  } else if (event.key === 'ArrowUp' && !suggestions.hidden) {
    event.preventDefault();
    setActiveSuggestion(activeSuggestion < 0 ? suggestionItems.length - 1 : activeSuggestion - 1);
  } else if (event.key === 'Enter' && activeSuggestion >= 0 && !suggestions.hidden) {
    event.preventDefault();
    selectAddress(suggestionItems[activeSuggestion]);
  } else if (event.key === 'Escape' && !suggestions.hidden) {
    hideSuggestions();
  }
});
searchForm.addEventListener('submit', submitSearch);

document.querySelectorAll('[data-search-term]').forEach((button) => {
  button.addEventListener('click', () => {
    searchInput.value = button.dataset.searchTerm;
    searchInput.focus();
    updateSuggestions();
  });
});

document.querySelectorAll('[data-open-dialog]').forEach((button) => {
  button.addEventListener('click', () => openDialog(button));
});

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (lastDialogTrigger?.isConnected) lastDialogTrigger.focus();
  });
});

fetch('./data/ceps.json')
  .then((response) => {
    if (!response.ok) throw new Error(`Falha ao carregar os dados: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    if (!Array.isArray(data.registros)) throw new Error('A base não contém uma lista de registros.');
    addresses = data.registros;
    const searchableCount = addresses.filter((item) => item.logradouro && item.cep).length;
    const omitted = addresses.filter((item) => !item.logradouro).length;

    resultCount.textContent = `${searchableCount} endereços com logradouro na base`;
    dataNote.textContent = omitted
      ? `Consulta de ${new Date(`${data.dataConsulta}T12:00:00`).toLocaleDateString('pt-BR')}: ${data.totalRetornosApi} respostas do ViaCEP, ${searchableCount} com nome de logradouro. ${omitted} resposta${omitted === 1 ? '' : 's'} sem nome de via foi preservada no JSON e não aparece como sugestão.`
      : `Consulta de ${new Date(`${data.dataConsulta}T12:00:00`).toLocaleDateString('pt-BR')}: ${data.totalRetornosApi} respostas do ViaCEP, todas com nome de logradouro.`;

    emptyState.hidden = false;
    emptyTitle.textContent = 'Comece por um endereço';
    emptyMessage.textContent = `Digite três letras ou mais. ${searchableCount} registros com nome de logradouro estão disponíveis nesta consulta.`;
  })
  .catch((error) => {
    console.error(error);
    resultCount.textContent = 'Base indisponível';
    emptyState.hidden = false;
    emptyTitle.textContent = 'Não foi possível carregar os endereços';
    emptyMessage.textContent = 'Confira sua conexão e abra o projeto por um servidor local ou pelo GitHub Pages.';
    showToast('A base de CEPs não foi carregada.');
  });
