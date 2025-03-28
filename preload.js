// Importa módulos do Electron para comunicação entre processos
const { contextBridge, ipcRenderer } = require('electron')

// Expõe API segura para o frontend acessar funcionalidades do Electron
contextBridge.exposeInMainWorld('electronAPI', {
  // Envia credenciais para validação de login
  login: (credentials) => ipcRenderer.invoke('user-login', credentials),
  
  // Envia dados para registro de novo usuário
  register: (userData) => ipcRenderer.invoke('user-register', userData),
  
  // Solicita logout do usuário
  logout: () => ipcRenderer.send('user-logout'),
  
  // Solicita dados do usuário logado
  getUserData: () => ipcRenderer.invoke('get-user-data'),
  
  // Solicita navegação para outra página
  navigateTo: (page) => ipcRenderer.send('navigate-to', page)
})