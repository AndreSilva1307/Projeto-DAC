// Dashboard do Paciente - Carrega quando a página é totalmente renderizada
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificação de Autenticação
  // Solicita os dados do paciente logado através da API Electron
  const userData = await window.electronAPI.getUserData()
  
  // Redireciona para login se não houver usuário autenticado
  if (!userData) {
    window.electronAPI.navigateTo('auth/login')
    return
  }

  // 2. Exibição das Informações do Paciente
  // Atualiza o nome no cabeçalho da página
  document.getElementById('userName').textContent = userData.name
  
  // Preenche o card de informações com os dados do paciente
  const userInfoEl = document.getElementById('userInfo')
  userInfoEl.innerHTML = `
    <p><strong>Email:</strong> ${userData.email}</p>
    <p><strong>Data Nasc.:</strong> ${formatDate(userData.birthDate) || 'Não informado'}</p>
    <p><strong>Plano de Saúde:</strong> ${userData.healthPlan || 'Não informado'}</p>
  `

  // 3. Configuração do Logout
  // Adiciona ação ao botão de sair
  document.getElementById('logoutBtn').addEventListener('click', () => {
    window.electronAPI.logout()
  })

  // Função auxiliar para formatação de data
  function formatDate(dateString) {
    if (!dateString) return null
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
    return new Date(dateString).toLocaleDateString('pt-BR', options)
  }
})