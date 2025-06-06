document.addEventListener('DOMContentLoaded', () => {
  // ========== BANCO DE DADOS EM MEMÓRIA (MOCK DATA) ==========
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
              status: 'ativo',
              consortiums: ['Imóvel'],
              reports: [
                  { id: 'rep01', type: 'Imóvel', creditValue: 300000, term: 180, adminFee: 18, reserveFund: 2, insurance: 0.5 },
              ]
          },
          {
              id: 'cli002',
              name: 'Bruno Lima',
              cpf: '222.333.444-55',
              phone: '(21) 99887-6655',
              email: 'bruno.lima@example.com',
              status: 'ativo',
              consortiums: ['Automóvel', 'Serviço'],
              reports: [
                  { id: 'rep02', type: 'Automóvel', creditValue: 80000, term: 72, adminFee: 15, reserveFund: 1, insurance: 0.3 },
                  { id: 'rep03', type: 'Serviço', creditValue: 20000, term: 36, adminFee: 20, reserveFund: 1.5, insurance: 0 },
              ]
          },
          {
              id: 'cli003',
              name: 'Carla Dias',
              cpf: '333.444.555-66',
              phone: '(31) 98888-7777',
              email: 'carla.dias@example.com',
              status: 'inativo',
              consortiums: ['Automóvel'],
              reports: [
                  { id: 'rep04', type: 'Automóvel', creditValue: 65000, term: 60, adminFee: 16, reserveFund: 1, insurance: 0.25 },
              ]
          },
          {
              id: 'cli004',
              name: 'Daniel Almeida',
              cpf: '444.555.666-77',
              phone: '(41) 97777-8888',
              email: 'daniel.almeida@example.com',
              status: 'aguardando',
              consortiums: [],
              reports: []
          }
      ]
  };
  let currentClientId = null;
  let currentReportId = null;

  // ========== ELEMENTOS DO DOM ==========
  const screens = {
      login: document.getElementById('screen-login'),
      main: document.getElementById('screen-main'),
  };
  const mainContent = document.getElementById('main-content');
  const headerTitle = document.getElementById('header-title');

  // ========== FUNÇÕES DE NAVEGAÇÃO E RENDERIZAÇÃO ==========
  
  function showScreen(screenName) {
      Object.values(screens).forEach(screen => screen.style.display = 'none');
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

          switch (contentName) {
              case 'dashboard':
                  renderDashboard();
                  break;
              case 'clients':
                  renderClientList();
                  break;
              case 'client-details':
                  renderClientDetails(currentClientId);
                  break;
              case 'report-details':
                  renderReportDetails(currentClientId, currentReportId);
                  break;
              case 'new-report':
                  renderNewReportForm(currentClientId);
                  break;
          }
          
          setupScreenSpecificListeners(contentName);
      }
  }
  
  function updateUI(contentName) {
      const titles = {
          dashboard: 'Dashboard',
          clients: 'Lista de Clientes',
          'client-details': 'Detalhes do Cliente',
          'report-details': 'Relatório Individual',
          'new-report': 'Criar Novo Relatório',
          settings: 'Configurações'
      };
      headerTitle.textContent = titles[contentName] || 'ConsórcioPro';
      
      document.querySelectorAll('.sidebar-link').forEach(link => {
          const target = link.dataset.target;
          let isActive = target === contentName;

          if ((contentName.includes('client') || contentName.includes('report') || contentName === 'new-report') && target === 'clients') {
              isActive = true;
          }
          
          if (isActive) {
              link.classList.add('active');
          } else {
              link.classList.remove('active');
          }
      });
  }

  // ========== FUNÇÕES DE RENDERIZAÇÃO DE CONTEÚDO ==========

  function renderDashboard() {
      const totalReports = mockData.clients.reduce((sum, client) => sum + client.reports.length, 0);
      const activeClients = mockData.clients.filter(c => c.status === 'ativo').length;
      const totalCredit = mockData.clients.reduce((sum, client) => 
          sum + client.reports.reduce((reportSum, report) => reportSum + report.creditValue, 0), 0
      );
      
      document.getElementById('kpi-reports').textContent = totalReports;
      document.getElementById('kpi-active-clients').textContent = activeClients;
      document.getElementById('kpi-total-credit').textContent = formatCurrency(totalCredit);
  }

  function renderClientList(filterText = '', filterStatus = 'all') {
      const tbody = document.getElementById('client-list-body');
      const noClientsMsg = document.getElementById('no-clients-message');
      tbody.innerHTML = '';

      const filteredClients = mockData.clients.filter(client => {
          const nameMatch = client.name.toLowerCase().includes(filterText.toLowerCase());
          const statusMatch = filterStatus === 'all' || client.status === filterStatus;
          return nameMatch && statusMatch;
      });

      if (filteredClients.length === 0) {
          noClientsMsg.classList.remove('hidden');
          return;
      }
      noClientsMsg.classList.add('hidden');

      const statusClasses = {
          ativo: 'bg-green-100 text-green-800',
          inativo: 'bg-red-100 text-red-800',
          aguardando: 'bg-yellow-100 text-yellow-800',
      };

      filteredClients.forEach(client => {
          const tr = document.createElement('tr');
          tr.className = 'border-b hover:bg-gray-50';
          tr.innerHTML = `
              <td class="p-4">
                  <div class="font-medium text-gray-800">${client.name}</div>
                  <div class="text-sm text-gray-500">${client.email}</div>
              </td>
              <td class="p-4">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[client.status]}">
                      ${client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
              </td>
              <td class="p-4 text-center font-medium text-gray-700">${client.reports.length}</td>
              <td class="p-4 text-right">
                  <div class="flex justify-end gap-2">
                      <button data-action="view-details" data-client-id="${client.id}" class="text-primary hover:underline text-sm font-semibold">Ver Detalhes</button>
                      <button data-action="new-report-from-list" data-client-id="${client.id}" class="bg-primary text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-opacity-90">Novo Relatório</button>
                  </div>
              </td>
          `;
          tbody.appendChild(tr);
      });
  }

  function renderClientDetails(clientId) {
      const client = mockData.clients.find(c => c.id === clientId);
      if (!client) return;

      document.getElementById('detail-client-name').textContent = client.name;
      document.getElementById('detail-client-cpf').textContent = client.cpf;
      document.getElementById('detail-client-phone').textContent = client.phone;
      document.getElementById('detail-client-email').textContent = client.email;
      
      const consortiumsDiv = document.getElementById('detail-client-consortiums');
      consortiumsDiv.innerHTML = '';
      if (client.consortiums.length > 0) {
          client.consortiums.forEach(type => {
              const tag = document.createElement('span');
              tag.className = 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full';
              tag.textContent = type;
              consortiumsDiv.appendChild(tag);
          });
      }

      const reportsList = document.getElementById('client-reports-list');
      const noReportsMsg = document.getElementById('no-reports-message');
      reportsList.innerHTML = '';

      if (client.reports.length === 0) {
          noReportsMsg.classList.remove('hidden');
      } else {
           noReportsMsg.classList.add('hidden');
           client.reports.forEach(report => {
              const card = document.createElement('div');
              card.className = 'border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50';
              card.innerHTML = `
                  <div>
                      <p class="font-semibold text-gray-800">Relatório de ${report.type}</p>
                      <p class="text-sm text-gray-500">Valor: ${formatCurrency(report.creditValue)} | Prazo: ${report.term} meses</p>
                  </div>
                  <button data-action="view-report" data-report-id="${report.id}" class="text-primary hover:underline font-semibold flex items-center gap-2">
                      Ver Relatório <i data-lucide="arrow-right" class="w-4 h-4"></i>
                  </button>
              `;
              reportsList.appendChild(card);
          });
      }
      if (window.lucide) window.lucide.createIcons();
  }
  
  function renderReportDetails(clientId, reportId) {
      const client = mockData.clients.find(c => c.id === clientId);
      const report = client?.reports.find(r => r.id === reportId);
      if (!report) return;

      const totalFees = report.adminFee + report.reserveFund + (report.insurance || 0);
      const totalAmount = report.creditValue * (1 + totalFees / 100);
      const installmentValue = totalAmount / report.term;
      
      const i = 0.01; 
      const n = report.term;
      const pv = report.creditValue;
      const financingInstallment = pv * ( (i * Math.pow(1+i, n)) / (Math.pow(1+i, n) - 1) );
      const financingTotal = financingInstallment * n;

      document.getElementById('report-type').textContent = report.type;
      document.getElementById('report-credit-value').textContent = formatCurrency(report.creditValue);
      document.getElementById('report-term').textContent = `${report.term} meses`;
      document.getElementById('report-admin-fee').textContent = `${report.adminFee}%`;
      document.getElementById('report-reserve-fund').textContent = `${report.reserveFund}%`;
      document.getElementById('report-insurance').textContent = `${report.insurance || 0}%`;
      document.getElementById('report-installment').textContent = formatCurrency(installmentValue);
      document.getElementById('report-total-paid').textContent = formatCurrency(totalAmount);
      
      document.getElementById('compare-consorcio-total').textContent = formatCurrency(totalAmount);
      document.getElementById('compare-financiamento-total').textContent = formatCurrency(financingTotal);
  }

  function renderNewReportForm(clientId){
      const client = mockData.clients.find(c => c.id === clientId);
      if (!client) return;
      document.getElementById('new-report-client-name').textContent = `Para o cliente: ${client.name}`;
  }

  // ========== INICIALIZAÇÃO E EVENT LISTENERS ==========

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
      
      if (contentName === 'new-report') {
          const form = document.getElementById('new-report-form');
          form.addEventListener('submit', (e) => {
              e.preventDefault();
              const client = mockData.clients.find(c => c.id === currentClientId);
              if (!client) return;

              const newReport = {
                  id: 'rep' + Date.now(),
                  type: document.getElementById('new-report-type').value,
                  creditValue: parseFloat(document.getElementById('new-report-credit').value) || 0,
                  term: parseInt(document.getElementById('new-report-term').value) || 0,
                  adminFee: parseFloat(document.getElementById('new-report-admin-fee').value) || 0,
                  reserveFund: parseFloat(document.getElementById('new-report-reserve-fund').value) || 0,
                  insurance: parseFloat(document.getElementById('new-report-insurance').value) || 0,
              };

              if(!client.consortiums.includes(newReport.type)){
                  client.consortiums.push(newReport.type);
              }

              client.reports.push(newReport);
              loadMainContent('client-details');
          });
      }
  }

  function init() {
      document.getElementById('consultant-name').textContent = mockData.consultant.name;
      document.getElementById('consultant-photo').src = mockData.consultant.photoUrl;

      document.getElementById('login-form').addEventListener('submit', (e) => {
          e.preventDefault();
          showScreen('main');
          loadMainContent('dashboard');
      });
      
      document.getElementById('logout-button').addEventListener('click', () => {
          showScreen('login');
      });

      document.querySelectorAll('.sidebar-link').forEach(link => {
          link.addEventListener('click', (e) => {
              e.preventDefault();
              loadMainContent(link.dataset.target);
          });
      });

      // Listener principal para ações (Delegação de Eventos)
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
              currentClientId = button.dataset.clientId;
              loadMainContent('new-report');
          } else if (action === 'new-report') {
              loadMainContent('new-report');
          } else if (action === 'back-to-client' || action === 'cancel-new-report') {
              loadMainContent('client-details');
          } else if(action === 'calculate-report'){
              const creditValue = parseFloat(document.getElementById('new-report-credit').value) || 0;
              const term = parseInt(document.getElementById('new-report-term').value) || 0;
              const adminFee = parseFloat(document.getElementById('new-report-admin-fee').value) || 0;
              const reserveFund = parseFloat(document.getElementById('new-report-reserve-fund').value) || 0;
              const insurance = parseFloat(document.getElementById('new-report-insurance').value) || 0;

              if(term > 0) {
                  const totalFees = adminFee + reserveFund + insurance;
                  const totalAmount = creditValue * (1 + totalFees / 100);
                  const installmentValue = totalAmount / term;

                  document.getElementById('result-installment').textContent = formatCurrency(installmentValue);
                  document.getElementById('result-total-paid').textContent = formatCurrency(totalAmount);
                  document.getElementById('calculation-result').classList.remove('hidden');
              } else {
                  alert('Por favor, insira um prazo válido para calcular.');
              }
          }
      });
      
      showScreen('login');
  }
  
  function formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  // Inicia a aplicação
  init();
});