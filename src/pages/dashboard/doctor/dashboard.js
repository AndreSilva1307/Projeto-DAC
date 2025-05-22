document.addEventListener('DOMContentLoaded', async () => {
  const userNameEl = document.getElementById('userName');
  const doctorSpecialtyEl = document.getElementById('doctorSpecialty');
  const doctorInfoEl = document.getElementById('doctorInfo');
  const patientsListEl = document.getElementById('patientsList');
  const logoutBtn = document.getElementById('logoutBtn');
  const refreshPatientsBtn = document.getElementById('refreshPatientsBtn');

  try {
    const userData = await window.electronAPI.getUserData();

    if (!userData || userData.userType !== 'doctor') {
      window.electronAPI.navigateTo('auth/login');
      return;
    }

    userNameEl.textContent = userData.name;
    doctorSpecialtyEl.textContent = userData.specialty || 'Sem especialidade definida';

    doctorInfoEl.innerHTML = `
      <div class="info-item">
        <span class="info-label">CRM:</span>
        <span class="info-value">${userData.crm || 'Não registrado'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email:</span>
        <span class="info-value">${userData.email}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Cadastro:</span>
        <span class="info-value">${new Date(userData.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
    `;

    const loadPatients = async () => {
      patientsListEl.innerHTML = '<p class="loading">Carregando pacientes...</p>';

      try {
        const patients = await window.electronAPI.getDoctorPatients(userData._id);

        if (!patients || patients.length === 0) {
          patientsListEl.innerHTML = '<p class="no-data">Nenhum paciente encontrado</p>';
          return;
        }

        patientsListEl.innerHTML = patients.map(patient => `
          <div class="patient-card">
            <h3>${patient.name}</h3>
            <p><strong>Plano:</strong> ${patient.healthPlan || 'Particular'}</p>
            <p><strong>Nascimento:</strong> ${formatDate(patient.birthDate)}</p>
            <p><strong>Idade:</strong> ${calculateAge(patient.birthDate)} anos</p>
            <div class="patient-card-buttons">
              <button class="btn small-btn" onclick="markAppointment('${patient._id}')">Marcar Consulta</button>
              <button class="btn small-btn" onclick="uploadFile('${patient._id}')">Arquivos</button>
            </div>
          </div>
        `).join('');
      } catch (error) {
        patientsListEl.innerHTML = '<p class="error">Erro ao carregar pacientes</p>';
        console.error('Erro ao carregar pacientes:', error);
      }
    };

    logoutBtn.addEventListener('click', () => window.electronAPI.logout());
    refreshPatientsBtn.addEventListener('click', loadPatients);

    await loadPatients();

  } catch (error) {
    console.error('Erro no dashboard do médico:', error);
    window.electronAPI.navigateTo('auth/login');
  }
});

function formatDate(dateString) {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function calculateAge(birthDate) {
  if (!birthDate) return '--';
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

// Placeholders para funcionalidades futuras
function markAppointment(patientId) {
  alert(`Abrir modal para marcar consulta com ID do paciente: ${patientId}`);
}

function uploadFile(patientId) {
  alert(`Abrir modal de upload de arquivos para paciente ID: ${patientId}`);
}
