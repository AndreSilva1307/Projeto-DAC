document.addEventListener('DOMContentLoaded', async () => {
  // Elementos do DOM
  const userNameEl = document.getElementById('userName');
  const patientInfoEl = document.getElementById('patientInfo');
  const appointmentsListEl = document.getElementById('appointmentsList');
  const logoutBtn = document.getElementById('logoutBtn');
  const refreshAppointmentsBtn = document.getElementById('refreshAppointmentsBtn');

  try {
    // Verificação de autenticação
    const userData = await window.electronAPI.getUserData();
    
    if (!userData || userData.userType !== 'patient') {
      window.electronAPI.navigateTo('auth/login');
      return;
    }

    // Preencher informações do paciente
    userNameEl.textContent = userData.name;
    
    patientInfoEl.innerHTML = `
      <div class="info-item">
        <span class="info-label">Email:</span>
        <span class="info-value">${userData.email}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Nascimento:</span>
        <span class="info-value">${formatDate(userData.birthDate)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Idade:</span>
        <span class="info-value">${calculateAge(userData.birthDate)} anos</span>
      </div>
      <div class="info-item">
        <span class="info-label">Plano de Saúde:</span>
        <span class="info-value">${userData.healthPlan || 'Particular'}</span>
      </div>
    `;

    // Carregar consultas
    const loadAppointments = async () => {
      appointmentsListEl.innerHTML = '<p class="loading">Carregando consultas...</p>';
      
      try {
        const appointments = await window.electronAPI.getScheduledAppointments(userData._id);
        
        if (appointments.length === 0) {
          appointmentsListEl.innerHTML = '<p class="no-data">Nenhuma consulta agendada</p>';
          return;
        }

        appointmentsListEl.innerHTML = appointments.map(appt => `
          <div class="appointment-card ${appt.urgent ? 'urgent' : ''}">
            <h3>Consulta com Dr. ${appt.doctorName}</h3>
            <p><strong>Data:</strong> ${formatDateTime(appt.date)}</p>
            <p><strong>Motivo:</strong> ${appt.reason || 'Não especificado'}</p>
            ${appt.notes ? `<p class="notes">${appt.notes}</p>` : ''}
          </div>
        `).join('');
      } catch (error) {
        appointmentsListEl.innerHTML = '<p class="error">Erro ao carregar consultas</p>';
        console.error('Erro ao carregar consultas:', error);
      }
    };

    // Event Listeners
    logoutBtn.addEventListener('click', () => {
      window.electronAPI.logout();
    });

    refreshAppointmentsBtn.addEventListener('click', loadAppointments);

    // Carregar dados iniciais
    await loadAppointments();

  } catch (error) {
    console.error('Erro no dashboard do paciente:', error);
    window.electronAPI.navigateTo('auth/login');
  }
});

// Funções auxiliares
function formatDate(dateString) {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
  if (!dateString) return '--/--/---- --:--';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}

function calculateAge(birthDate) {
  if (!birthDate) return '--';
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}