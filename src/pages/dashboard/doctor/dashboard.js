// Executa quando o conteúdo da página é totalmente carregado
document.addEventListener('DOMContentLoaded', async () => {
  // Obtém os dados do usuário através da API do Electron
  const userData = await window.electronAPI.getUserData()
  
  // Se não houver usuário logado, redireciona para a página de login
  if (!userData) {
    window.electronAPI.navigateTo('auth/login')
    return // Interrompe a execução do restante do código
  }

  // Exibe o nome do usuário no elemento com ID 'userName'
  document.getElementById('userName').textContent = userData.name
  
  // Preenche as informações do usuário no elemento com ID 'userInfo'
  const userInfoEl = document.getElementById('userInfo')
  userInfoEl.innerHTML = `
    <p><strong>Email:</strong> ${userData.email}</p>
    <p><strong>CRM:</strong> ${userData.crm || 'Não informado'}</p>
    <p><strong>Especialidade:</strong> ${userData.specialty || 'Não informado'}</p>
  `

  // Adiciona um listener para o botão de logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    // Chama a função de logout da API do Electron
    window.electronAPI.logout()
  })
})