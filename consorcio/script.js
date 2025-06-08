document.addEventListener('DOMContentLoaded', () => {
  const mockData = {
    consultant: {
      id: 'CON123',
      name: 'Carlos Silva',
      photoUrl: 'https://i.pravatar.cc/150?u=carlos',
    },
    clients: [
      {
        id: 'cli001',
        name: 'Ana Paula Rodrigues',
        cpf: '111.222.333-44',
        phone: '(11) 98765-4321',
        email: 'ana.rodrigues@example.com',
        address: 'Rua Exemplo, 1, São Paulo - SP',
        status: 'ativo',
        consortiums: ['Imóvel'],
        reports: [
          {
            id: 'rep01',
            type: 'Imóvel',
            creditValue: 300000,
            term: 180,
            adminFee: 18,
            reserveFund: 2,
            insurance: 0.5,
          },
        ],
      },
      {
        id: 'cli002',
        name: 'Bruno Lima',
        cpf: '222.333.444-55',
        phone: '(21) 99887-6655',
        email: 'bruno.lima@example.com',
        address: 'Avenida Teste, 2, Rio de Janeiro - RJ',
        status: 'ativo',
        consortiums: ['Automóvel', 'Serviço'],
        reports: [
          {
            id: 'rep02',
            type: 'Automóvel',
            creditValue: 80000,
            term: 72,
            adminFee: 15,
            reserveFund: 1,
            insurance: 0.3,
          },
          {
            id: 'rep03',
            type: 'Serviço',
            creditValue: 20000,
            term: 36,
            adminFee: 20,
            reserveFund: 1.5,
            insurance: 0,
          },
        ],
      },
      {
        id: 'cli003',
        name: 'Carla Dias',
        cpf: '333.444.555-66',
        phone: '(31) 98888-7777',
        email: 'carla.dias@example.com',
        address: 'Praça de Amostra, 3, Belo Horizonte - MG',
        status: 'inativo',
        consortiums: ['Automóvel'],
        reports: [
          {
            id: 'rep04',
            type: 'Automóvel',
            creditValue: 65000,
            term: 60,
            adminFee: 16,
            reserveFund: 1,
            insurance: 0.25,
          },
        ],
      },
      {
        id: 'cli004',
        name: 'Daniel Almeida',
        cpf: '444.555.666-77',
        phone: '(41) 97777-8888',
        email: 'daniel.almeida@example.com',
        address: 'Alameda Fictícia, 4, Curitiba - PR',
        status: 'aguardando',
        consortiums: [],
        reports: [],
      },
    ],
  };
  let currentClientId = null;
  let currentReportId = null;
  let previousPageForReport = 'clients';

  const screens = {
    login: document.getElementById('screen-login'),
    main: document.getElementById('screen-main'),
  };
  const mainContent = document.getElementById('main-content');
  const headerTitle = document.getElementById('header-title');

  function showScreen(screenName) {
    Object.values(screens).forEach((screen) => (screen.style.display = 'none'));
    if (screens[screenName]) {
      screens[screenName].style.display = 'flex';
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  function loadMainContent(contentName) {
    mainContent.innerHTML = '';
    const template = document.getElementById(`template-${contentName}`);
    if (template) {
      const content = template.content.cloneNode(true);
      mainContent.appendChild(content);
      updateUI(contentName);

      // A lógica de renderização e de 'listeners' agora fica toda no switch
      switch (contentName) {
        case 'dashboard':
          renderDashboard();
          break;
        case 'clients':
          renderClientList();
          setupScreenSpecificListeners(contentName); // Adicionado aqui para garantir
          break;
        case 'client-details':
          renderClientDetails(currentClientId);
          break;
        case 'report-details':
          renderReportDetails(currentClientId, currentReportId);
          break;
        case 'new-report':
          renderNewReportForm(currentClientId);
          // CORREÇÃO: A chamada para setupScreenSpecificListeners foi movida para DENTRO do case.
          // Isso garante que o listener do formulário seja sempre anexado quando esta tela carregar.
          setupScreenSpecificListeners(contentName);
          break;
        case 'new-client':
          setupScreenSpecificListeners(contentName); // Adicionado aqui para garantir
          break;
        case 'edit-client':
          renderEditClientForm(currentClientId);
          setupScreenSpecificListeners(contentName); // Adicionado aqui para garantir
          break;
      }

      // A chamada original que estava aqui no final foi removida/redistribuída para dentro do switch.
    }
  }

  function updateUI(contentName) {
    const titles = {
      dashboard: 'Dashboard',
      clients: 'Lista de Clientes',
      'new-client': 'Adicionar Novo Cliente',
      'client-details': 'Detalhes do Cliente',
      'report-details': 'Relatório Individual',
      'new-report': 'Criar Novo Relatório',
      'edit-client': 'Editar Cliente',
      settings: 'Configurações',
    };
    headerTitle.textContent = titles[contentName] || 'ConsórcioPro';

    document.querySelectorAll('.sidebar-link').forEach((link) => {
      const target = link.dataset.target;
      let isActive = target === contentName;
      if (
        (contentName.includes('client') ||
          contentName.includes('report') ||
          contentName === 'new-report' ||
          contentName === 'new-client') &&
        target === 'clients'
      ) {
        isActive = true;
      }

      if (isActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function renderEditClientForm(clientId) {
    const client = mockData.clients.find((c) => c.id === clientId);
    if (!client) {
      alert('Cliente não encontrado!');
      loadMainContent('clients');
      return;
    }

    // Preenche os campos do formulário com os dados do cliente
    document.getElementById(
      'edit-client-id-display',
    ).textContent = `Editando o cliente ID: ${client.id}`;
    document.getElementById('edit-client-name').value = client.name;
    document.getElementById('edit-client-cpf').value = client.cpf;
    document.getElementById('edit-client-phone').value = client.phone;
    document.getElementById('edit-client-email').value = client.email;
    document.getElementById('edit-client-address').value = client.address;
  }

  function renderDashboard() {
    const totalReports = mockData.clients.reduce(
      (sum, client) => sum + client.reports.length,
      0,
    );
    const activeClients = mockData.clients.filter(
      (c) => c.status === 'ativo',
    ).length;
    const totalCredit = mockData.clients.reduce(
      (sum, client) =>
        sum +
        client.reports.reduce(
          (reportSum, report) => reportSum + report.creditValue,
          0,
        ),
      0,
    );

    document.getElementById('kpi-reports').textContent = totalReports;
    document.getElementById('kpi-active-clients').textContent = activeClients;
    document.getElementById('kpi-total-credit').textContent =
      formatCurrency(totalCredit);
  }

  function renderClientList(filterText = '', filterStatus = 'all') {
    const tbody = document.getElementById('client-list-body');
    const noClientsMsg = document.getElementById('no-clients-message');
    tbody.innerHTML = '';

    const filteredClients = mockData.clients.filter((client) => {
      const nameMatch = client.name
        .toLowerCase()
        .includes(filterText.toLowerCase());
      const statusMatch =
        filterStatus === 'all' || client.status === filterStatus;
      return nameMatch && statusMatch;
    });

    if (filteredClients.length === 0) {
      noClientsMsg.classList.remove('hidden');
      return;
    }
    noClientsMsg.classList.add('hidden');

    const statusClasses = {
      ativo: 'bg-green-100 text-green-800 hover:ring-green-300',
      inativo: 'bg-red-100 text-red-800 hover:ring-red-300',
      aguardando: 'bg-yellow-100 text-yellow-800 hover:ring-yellow-300',
    };

    filteredClients.forEach((client) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b hover:bg-gray-50';
      tr.innerHTML = `
              <td class="p-4">
                  <div class="font-medium text-gray-800">${client.name}</div>
                  <div class="text-sm text-gray-500">${client.email}</div>
              </td>
              <td class="p-4">
                  <button
                    data-action="toggle-status"
                    data-client-id="${client.id}"
                    title="Clique para alterar o status"
                    class="w-24 text-center px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 ${
                      statusClasses[client.status]
                    }">
                    ${
                      client.status.charAt(0).toUpperCase() +
                      client.status.slice(1)
                    }
                  </button>
              </td>
              <td class="p-4 text-center font-medium text-gray-700">${
                client.reports.length
              }</td>
              <td class="p-4 text-right">
                  <div class="flex justify-end items-center gap-2">
                      <button data-action="view-details" data-client-id="${
                        client.id
                      }" class="text-primary hover:underline text-sm font-semibold">Ver Detalhes</button>
                      <button data-action="new-report-from-list" data-client-id="${
                        client.id
                      }" class="bg-primary text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-opacity-90">Novo Relatório</button>
                      
                      <button data-action="edit-client" data-client-id="${
                        client.id
                      }" title="Editar Cliente" class="text-blue-600 p-2 rounded-md hover:bg-gray-100">
                          <i data-lucide="file-pen-line" class="w-4 h-4 pointer-events-none"></i>
                      </button>
                      
                      <button data-action="delete-client" data-client-id="${
                        client.id
                      }" title="Excluir Cliente" class="btn-delete text-red-600 p-2 rounded-md hover:bg-gray-100">
                          <i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i>
                      </button>
                  </div>
              </td>
          `;
      tbody.appendChild(tr);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Substitua esta função inteira
  function renderClientDetails(clientId) {
    const client = mockData.clients.find((c) => c.id === clientId);
    if (!client) {
      // Se o cliente não for encontrado, volta para a lista
      loadMainContent('clients');
      return;
    }

    // Preenche os dados básicos do cliente
    document.getElementById('detail-client-name').textContent = client.name;
    document.getElementById('detail-client-cpf').textContent = client.cpf;
    document.getElementById('detail-client-phone').textContent = client.phone;
    document.getElementById('detail-client-email').textContent = client.email;
    document.getElementById('detail-client-address').textContent =
      client.address;

    // Lógica para adicionar a "tag" de Status
    const statusContainer = document.getElementById(
      'detail-client-status-container',
    );
    statusContainer.innerHTML = '';
    const statusClasses = {
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-red-100 text-red-800',
      aguardando: 'bg-yellow-100 text-yellow-800',
    };
    const statusTag = document.createElement('span');
    statusTag.className = `px-2.5 py-0.5 text-sm font-medium rounded-full ${
      statusClasses[client.status]
    }`;
    statusTag.textContent =
      client.status.charAt(0).toUpperCase() + client.status.slice(1);
    statusContainer.appendChild(statusTag);

    // Lógica para adicionar as tags dos tipos de consórcio
    const consortiumsDiv = document.getElementById('detail-client-consortiums');
    consortiumsDiv.innerHTML = '';
    if (client.consortiums.length > 0) {
      client.consortiums.forEach((type) => {
        const tag = document.createElement('span');
        tag.className =
          'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full';
        tag.textContent = type;
        consortiumsDiv.appendChild(tag);
      });
    } else {
      const noConsortiums = document.createElement('p');
      noConsortiums.className = 'text-sm text-gray-500';
      noConsortiums.textContent = 'Nenhum tipo de consórcio ativo.';
      consortiumsDiv.appendChild(noConsortiums);
    }

    // Lógica para renderizar a lista de relatórios
    const reportsList = document.getElementById('client-reports-list');
    const noReportsMsg = document.getElementById('no-reports-message');
    reportsList.innerHTML = '';

    if (client.reports.length === 0) {
      noReportsMsg.classList.remove('hidden');
    } else {
      noReportsMsg.classList.add('hidden');
      client.reports.forEach((report) => {
        const card = document.createElement('div');
        card.className =
          'border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors';
        card.innerHTML = `
              <div>
                  <p class="font-semibold text-gray-800">Relatório de ${
                    report.type
                  }</p>
                  <p class="text-sm text-gray-500">Valor: ${formatCurrency(
                    report.creditValue,
                  )} | Prazo: ${report.term} meses</p>
              </div>
              <button data-action="view-report" data-report-id="${
                report.id
              }" class="text-primary hover:underline font-semibold flex items-center gap-2">
                  Ver Relatório <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
          `;
        reportsList.appendChild(card);
      });
    }

    // ===================================================================
    // CORREÇÃO APLICADA AQUI
    // O seletor agora busca o botão dentro da área de conteúdo principal (#main-content),
    // que é o local correto onde o botão está quando a página é exibida.
    const newReportButton = document.querySelector(
      '#main-content button[data-action="new-report-from-list"]',
    );
    if (newReportButton) {
      newReportButton.dataset.clientId = clientId;
    }
    // ===================================================================

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
  function renderReportDetails(clientId, reportId) {
    const client = mockData.clients.find((c) => c.id === clientId);
    const report = client?.reports.find((r) => r.id === reportId);
    if (!report) return;

    const totalFees =
      report.adminFee + report.reserveFund + (report.insurance || 0);
    const totalAmount = report.creditValue * (1 + totalFees / 100);
    const installmentValue = totalAmount / report.term;

    const i = 0.01;
    const n = report.term;
    const pv = report.creditValue;
    const financingInstallment =
      pv * ((i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));
    const financingTotal = financingInstallment * n;

    document.getElementById('report-type').textContent = report.type;
    document.getElementById('report-credit-value').textContent = formatCurrency(
      report.creditValue,
    );
    document.getElementById('report-term').textContent = `${report.term} meses`;
    document.getElementById(
      'report-admin-fee',
    ).textContent = `${report.adminFee}%`;
    document.getElementById(
      'report-reserve-fund',
    ).textContent = `${report.reserveFund}%`;
    document.getElementById('report-insurance').textContent = `${
      report.insurance || 0
    }%`;
    document.getElementById('report-installment').textContent =
      formatCurrency(installmentValue);
    document.getElementById('report-total-paid').textContent =
      formatCurrency(totalAmount);

    document.getElementById('compare-consorcio-total').textContent =
      formatCurrency(totalAmount);
    document.getElementById('compare-financiamento-total').textContent =
      formatCurrency(financingTotal);
  }

  function renderNewReportForm(clientId) {
    const client = mockData.clients.find((c) => c.id === clientId);
    if (!client) return;
    document.getElementById(
      'new-report-client-name',
    ).textContent = `Para o cliente: ${client.name}`;
  }

  // Substitua também esta função para evitar problemas futuros
  function updateReportFormFields(selectedType) {
    document.getElementById('form-fields-imovel').classList.add('hidden');
    document.getElementById('form-fields-automovel').classList.add('hidden');
    document.getElementById('form-fields-servico').classList.add('hidden');

    const correctedCreditContainer = document.getElementById(
      'corrected-credit-container',
    );
    if (correctedCreditContainer) {
      correctedCreditContainer.classList.add('hidden');
    }

    // CORREÇÃO: 'Serviço' agora usa os mesmos campos de 'Automóvel'
    switch (selectedType) {
      case 'Automóvel':
      case 'Serviço':
        document
          .getElementById('form-fields-automovel')
          .classList.remove('hidden');
        break;
      case 'Imóvel':
      default:
        document
          .getElementById('form-fields-imovel')
          .classList.remove('hidden');
        break;
    }
  }

  function setupScreenSpecificListeners(contentName) {
    if (contentName === 'clients') {
      const searchInput = document.getElementById('search-client');
      const statusFilter = document.getElementById('filter-status');

      const applyFilters = () => {
        renderClientList(searchInput.value, statusFilter.value);
      };

      searchInput.addEventListener('input', applyFilters);
      statusFilter.addEventListener('change', applyFilters);
    }

    if (contentName === 'edit-client') {
      const form = document.getElementById('edit-client-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const clientIndex = mockData.clients.findIndex(
          (c) => c.id === currentClientId,
        );
        if (clientIndex === -1) {
          alert('Erro: Cliente não encontrado para salvar.');
          return;
        }

        // Atualiza os dados no mockData
        mockData.clients[clientIndex].name =
          document.getElementById('edit-client-name').value;
        mockData.clients[clientIndex].cpf =
          document.getElementById('edit-client-cpf').value;
        mockData.clients[clientIndex].phone =
          document.getElementById('edit-client-phone').value;
        mockData.clients[clientIndex].email =
          document.getElementById('edit-client-email').value;
        mockData.clients[clientIndex].address = document.getElementById(
          'edit-client-address',
        ).value;

        alert('Cliente atualizado com sucesso!');
        loadMainContent('clients'); // Volta para a lista
      });
    }
    if (contentName === 'new-client') {
      const form = document.getElementById('new-client-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const newClient = {
          id: 'cli' + Date.now(),
          name: document.getElementById('new-client-name').value,
          cpf: document.getElementById('new-client-cpf').value,
          phone: document.getElementById('new-client-phone').value,
          email: document.getElementById('new-client-email').value,
          address: document.getElementById('new-client-address').value,
          status: 'aguardando',
          consortiums: [],
          reports: [],
        };

        mockData.clients.unshift(newClient);
        loadMainContent('clients');
      });
    }

    if (contentName === 'new-report') {
      const typeSelect = document.getElementById('new-report-type');

      typeSelect.addEventListener('change', () => {
        updateReportFormFields(typeSelect.value);
      });

      updateReportFormFields(typeSelect.value);

      const form = document.getElementById('new-report-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const client = mockData.clients.find((c) => c.id === currentClientId);
        if (!client) return;

        const reportType = document.getElementById('new-report-type').value;
        let newReport = { id: 'rep' + Date.now(), type: reportType };

        if (reportType === 'Imóvel') {
          newReport.creditValue =
            parseFloat(document.getElementById('imovel-credit').value) || 0;
          newReport.adminFee =
            parseFloat(document.getElementById('imovel-admin-fee').value) || 0;
          newReport.reserveFund =
            parseFloat(document.getElementById('imovel-reserve-fund').value) ||
            0;
          newReport.correctionRate =
            parseFloat(
              document.getElementById('imovel-correction-rate').value,
            ) || 0;
          newReport.insurance =
            parseFloat(document.getElementById('imovel-insurance').value) || 0;
          newReport.term = 180; // Prazo fixo para Imóvel
        } else if (reportType === 'Automóvel' || reportType === 'Serviço') {
          newReport.creditValue =
            parseFloat(document.getElementById('auto-credit').value) || 0;
          newReport.adminFee =
            parseFloat(document.getElementById('auto-admin-fee').value) || 0;
          newReport.reserveFund =
            parseFloat(document.getElementById('auto-reserve-fund').value) || 0;
          newReport.insurance =
            parseFloat(document.getElementById('auto-insurance').value) || 0;
          newReport.downPayment =
            parseFloat(document.getElementById('auto-down-payment').value) || 0;
          newReport.term = reportType === 'Automóvel' ? 60 : 36; // Prazos diferentes para Auto e Serviço
        }

        if (!client.consortiums.includes(newReport.type)) {
          client.consortiums.push(newReport.type);
        }
        client.reports.push(newReport);
        loadMainContent('client-details');
      });
    }
  }

  function init() {
    document.getElementById('consultant-name').textContent =
      mockData.consultant.name;
    document.getElementById('consultant-photo').src =
      mockData.consultant.photoUrl;

    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      showScreen('main');
      loadMainContent('dashboard');
    });

    document.getElementById('logout-button').addEventListener('click', () => {
      showScreen('login');
    });

    document.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        loadMainContent(link.dataset.target);
      });
    });

    document.body.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-action]');
      if (!button) return;

      e.preventDefault();
      const action = button.dataset.action;

      if (action === 'view-details') {
        currentClientId = button.dataset.clientId;
        loadMainContent('client-details');
      } else if (action === 'view-report') {
        currentReportId = button.dataset.reportId;
        loadMainContent('report-details');
      } else if (action === 'new-report-from-list') {
        if (button.closest('tr')) {
          previousPageForReport = 'clients';
        } else {
          previousPageForReport = 'client-details';
        }
        currentClientId = button.dataset.clientId;
        loadMainContent('new-report');
      } else if (action === 'new-report') {
        loadMainContent('new-report');
      } else if (action === 'add-new-client') {
        loadMainContent('new-client');
      } else if (action === 'back-to-clients') {
        loadMainContent('clients');
      } else if (action === 'edit-client') {
        currentClientId = button.dataset.clientId;
        loadMainContent('edit-client');
      } else if (action === 'back-to-client') {
        loadMainContent('client-details');
      } else if (action === 'cancel-new-report') {
        loadMainContent(previousPageForReport);
      } else if (action === 'toggle-status') {
        const clientIdToToggle = button.dataset.clientId;
        const client = mockData.clients.find((c) => c.id === clientIdToToggle);

        if (client) {
          const statusOrder = ['ativo', 'inativo', 'aguardando'];
          const currentIndex = statusOrder.indexOf(client.status);
          // Pula para o próximo status na lista, ou volta para o início
          const nextIndex = (currentIndex + 1) % statusOrder.length;
          client.status = statusOrder[nextIndex];

          // Atualiza a lista de clientes para refletir a mudança
          // É importante pegar os valores dos filtros para não perder a busca atual
          const searchInput = document.getElementById('search-client');
          const statusFilter = document.getElementById('filter-status');
          renderClientList(searchInput?.value, statusFilter?.value);
        }
      } else if (action === 'calculate-report') {
        const reportType = document.getElementById('new-report-type').value;
        document
          .getElementById('corrected-credit-container')
          .classList.add('hidden');

        if (reportType === 'Imóvel') {
          const creditValue =
            parseFloat(document.getElementById('imovel-credit').value) || 0;
          const adminFee =
            parseFloat(document.getElementById('imovel-admin-fee').value) || 0;
          const reserveFund =
            parseFloat(document.getElementById('imovel-reserve-fund').value) ||
            0;
          const correctionRate =
            parseFloat(
              document.getElementById('imovel-correction-rate').value,
            ) || 0;
          const term = 180;

          if (term > 0 && creditValue > 0) {
            const totalAmount =
              creditValue * (1 + adminFee / 100 + reserveFund / 100);
            const installmentValue = totalAmount / term;
            const correctedValue = creditValue * (1 + correctionRate / 100);

            document.getElementById('result-installment').textContent =
              formatCurrency(installmentValue);
            document.getElementById('result-total-paid').textContent =
              formatCurrency(totalAmount);
            document.getElementById('result-corrected-credit').textContent =
              formatCurrency(correctedValue);
            document
              .getElementById('corrected-credit-container')
              .classList.remove('hidden');
            document
              .getElementById('calculation-result')
              .classList.remove('hidden');
          } else {
            alert('Por favor, insira valores válidos para calcular.');
          }
        } else {
          const creditValue =
            parseFloat(document.getElementById('auto-credit').value) || 0;
          const adminFee =
            parseFloat(document.getElementById('auto-admin-fee').value) || 0;
          const reserveFund =
            parseFloat(document.getElementById('auto-reserve-fund').value) || 0;
          const insurance =
            parseFloat(document.getElementById('auto-insurance').value) || 0;
          const term = reportType === 'Automóvel' ? 60 : 36;

          if (term > 0 && creditValue > 0) {
            const totalFees = adminFee + reserveFund + insurance;
            const totalAmount = creditValue * (1 + totalFees / 100);
            const installmentValue = totalAmount / term;
            document.getElementById('result-installment').textContent =
              formatCurrency(installmentValue);
            document.getElementById('result-total-paid').textContent =
              formatCurrency(totalAmount);
            document
              .getElementById('calculation-result')
              .classList.remove('hidden');
          } else {
            alert('Por favor, insira valores válidos para calcular.');
          }
        }
      } else if (action === 'delete-client') {
        const clientIdToDelete = button.dataset.clientId;
        const clientIndex = mockData.clients.findIndex(
          (c) => c.id === clientIdToDelete,
        );

        if (clientIndex > -1) {
          const clientName = mockData.clients[clientIndex].name;
          if (
            confirm(
              `Tem certeza que deseja excluir o cliente "${clientName}"? Esta ação não pode ser desfeita.`,
            )
          ) {
            mockData.clients.splice(clientIndex, 1);
            const searchInput = document.getElementById('search-client');
            const statusFilter = document.getElementById('filter-status');
            renderClientList(searchInput?.value, statusFilter?.value);
          }
        }
      }
    });

    showScreen('login');
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  init();
});
