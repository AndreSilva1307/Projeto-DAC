// Aguarda o carregamento completo do DOM antes de executar o código
document.addEventListener('DOMContentLoaded', () => {
  // Obtém referências aos elementos do formulário
  const loginForm = document.getElementById('loginForm')
  const registerLink = document.getElementById('registerLink')

  // Adiciona listener para o evento de submit do formulário
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault() // Impede o comportamento padrão de submit
    
    // Obtém os valores dos campos do formulário
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const userType = document.getElementById('userType').value
    
    try {
      // Chama a API do Electron para fazer login
      const result = await window.electronAPI.login({ email, password, userType })
      
      // Verifica se o login foi bem-sucedido
      if (result.success) {
        // Navega para o dashboard correspondente ao tipo de usuário
        window.electronAPI.navigateTo(`dashboard/${userType}/dashboard`)
      } else {
        // Exibe mensagem de erro retornada pela API ou uma mensagem padrão
        alert(result.message || 'Erro no login')
      }
    } catch (error) {
      // Loga o erro no console e exibe mensagem genérica
      console.error('Login error:', error)
      alert('Erro ao fazer login')
    }
  })

  // Adiciona listener para o link de registro
  registerLink.addEventListener('click', (e) => {
    e.preventDefault() // Impede o comportamento padrão do link
    // Navega para a página de registro
    window.electronAPI.navigateTo('auth/register')
  })
})