// Executa quando o conteúdo da página é carregado
document.addEventListener('DOMContentLoaded', () => {
  // Obtém elementos do DOM
  const userTypeSelect = document.getElementById('userType') // Selector de tipo de usuário
  const registerForm = document.getElementById('registerForm') // Formulário de registro
  const loginLink = document.getElementById('loginLink') // Link para login

  // Controla a exibição dos campos específicos por tipo de usuário
  userTypeSelect.addEventListener('change', (e) => {
      // Esconde todos os campos específicos
      document.querySelectorAll('.user-type-fields').forEach(el => {
          el.style.display = 'none'
      })
      
      // Mostra campos conforme tipo selecionado
      if (e.target.value === 'patient') {
          document.getElementById('patientFields').style.display = 'block'
      } else if (e.target.value === 'doctor') {
          document.getElementById('doctorFields').style.display = 'block'
      }
  })

  // Manipula o envio do formulário de registro
  registerForm.addEventListener('submit', async (e) => {
      e.preventDefault() // Impede envio padrão do formulário
      
      // Obtém valores dos campos
      const userType = document.getElementById('userType').value
      const name = document.getElementById('name').value
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      const confirmPassword = document.getElementById('confirmPassword').value
      
      // Valida se senhas coincidem
      if (password !== confirmPassword) {
          alert('As senhas não coincidem')
          return
      }
      
      // Prepara objeto com dados básicos
      let userData = {
          userType,
          name,
          email,
          password
      }
      
      // Adiciona campos específicos conforme tipo de usuário
      if (userType === 'patient') {
          userData.birthDate = document.getElementById('birthDate').value
          userData.healthPlan = document.getElementById('healthPlan').value
      } else if (userType === 'doctor') {
          userData.crm = document.getElementById('crm').value
          userData.specialty = document.getElementById('specialty').value
      }
      
      try {
          // Envia dados para registro via API Electron
          const result = await window.electronAPI.register(userData)
          
          // Trata resultado do registro
          if (result.success) {
              alert('Registro realizado com sucesso!')
              window.electronAPI.navigateTo('auth/login') // Redireciona para login
          } else {
              alert(result.message || 'Erro no registro') // Mostra erro
          }
      } catch (error) {
          console.error('Registration error:', error) // Log de erro
          alert('Erro ao registrar') // Feedback ao usuário
      }
  })

  // Redireciona para página de login
  loginLink.addEventListener('click', (e) => {
      e.preventDefault()
      window.electronAPI.navigateTo('auth/login')
  })
})