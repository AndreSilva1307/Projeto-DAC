// Importa os módulos necessários do Electron e outras dependências
const { app, BrowserWindow, ipcMain } = require('electron') // Módulos principais do Electron
const path = require('path') // Módulo de caminhos do Node.js
const { db, hashPassword, comparePassword } = require('./src/database/db') // Funções do banco de dados

// Variáveis globais para gerenciar o estado da aplicação
let mainWindow // Referência à janela principal da aplicação
let currentUser = null // Armazena o usuário atualmente logado

/**
 * Cria a janela principal da aplicação
 */
function createWindow() {
  // Configura e cria a janela do navegador
  mainWindow = new BrowserWindow({
    width: 1920, // Largura da janela
    height: 1080, // Altura da janela
    frame: false, // Remove a barra de título padrão
    fullscreen: false, // Opcional - define se inicia em tela cheia
    webPreferences: { // Configurações de segurança e comportamento
      nodeIntegration: false, // Desabilita integração direta com Node.js no frontend (segurança)
      contextIsolation: true, // Isola o contexto do Electron (segurança)
      enableRemoteModule: false, // Desabilita módulo remoto (segurança)
      preload: path.join(__dirname, 'preload.js') // Script de pré-carregamento
    }
  })

  // Carrega a página inicial de login
  mainWindow.loadFile('src/pages/auth/login.html')

  // Evento quando a janela é fechada
  mainWindow.on('closed', () => {
    mainWindow = null // Limpa a referência
  })
}

/**
 * Handler para o evento de login via IPC (comunicação entre processos)
 */
ipcMain.handle('user-login', async (_, credentials) => {
  try {
    // Busca o usuário no banco de dados pelo email
    const user = await new Promise((resolve, reject) => {
      db.users.findOne({ email: credentials.email }, (err, user) => {
        if (err) return reject(err)
        resolve(user)
      })
    })

    // Verifica se o usuário existe
    if (!user) return { success: false, message: 'Usuário não encontrado' }
    
    // Verifica se o tipo de usuário está correto
    if (user.userType !== credentials.userType) {
      return { success: false, message: 'Tipo de usuário incorreto' }
    }

    // Compara a senha fornecida com o hash armazenado
    const isMatch = await comparePassword(credentials.password, user.password)
    if (!isMatch) return { success: false, message: 'Senha incorreta' }

    // Determina qual coleção usar baseado no tipo de usuário
    const userCollection = credentials.userType === 'patient' ? db.patients : db.doctors
    
    // Busca os dados específicos do usuário (paciente ou médico)
    const userData = await new Promise((resolve, reject) => {
      userCollection.findOne({ userId: user._id }, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })

    // Armazena o usuário logado e retorna os dados
    currentUser = { ...user, ...userData }
    return { success: true, user: currentUser }
  } catch (error) {
    console.error('Erro no login:', error)
    return { success: false, message: 'Erro no servidor' }
  }
})

/**
 * Handler para o evento de registro via IPC
 */
ipcMain.handle('user-register', async (_, userData) => {
  try {
    // Verifica se o email já está cadastrado
    const existingUser = await new Promise((resolve, reject) => {
      db.users.findOne({ email: userData.email }, (err, user) => {
        if (err) return reject(err)
        resolve(user)
      })
    })

    if (existingUser) return { success: false, message: 'Email já está em uso' }

    // Cria o hash da senha para armazenamento seguro
    const hashedPassword = await hashPassword(userData.password)
    
    // Cria o objeto base do usuário
    const baseUser = {
      email: userData.email,
      password: hashedPassword,
      userType: userData.userType,
      createdAt: new Date()
    }

    // Insere o usuário na coleção principal
    const newUser = await new Promise((resolve, reject) => {
      db.users.insert(baseUser, (err, user) => {
        if (err) return reject(err)
        resolve(user)
      })
    })

    // Prepara os dados específicos (paciente ou médico)
    const specificData = {
      userId: newUser._id,
      name: userData.name,
    }

    // Adiciona campos específicos conforme o tipo de usuário
    if (userData.userType === 'patient') {
      Object.assign(specificData, {
        birthDate: userData.birthDate,
        healthPlan: userData.healthPlan
      })
    } else {
      Object.assign(specificData, {
        crm: userData.crm,
        specialty: userData.specialty
      })
    }

    // Determina a coleção correta e insere os dados específicos
    const collection = userData.userType === 'patient' ? db.patients : db.doctors
    await new Promise((resolve, reject) => {
      collection.insert(specificData, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Erro no registro:', error)
    return { success: false, message: 'Erro no registro' }
  }
})

/**
 * Retorna os dados do usuário atualmente logado
 */
ipcMain.handle('get-user-data', () => currentUser)

/**
 * Handler para logout do usuário
 */
ipcMain.on('user-logout', () => {
  currentUser = null // Limpa o usuário atual
  mainWindow.loadFile('src/pages/auth/login.html') // Redireciona para a página de login
})

/**
 * Handler para navegação entre páginas
 */
ipcMain.on('navigate-to', (_, page) => {
  mainWindow.loadFile(`src/pages/${page}.html`) // Carrega a página solicitada
})

// Eventos do ciclo de vida do Electron

// Quando o Electron estiver pronto, cria a janela
app.whenReady().then(createWindow)

// Fecha a aplicação quando todas as janelas estiverem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Recria a janela quando o app é ativado (macOS)
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

// Adicione este handler no seu main.js existente
ipcMain.on('navigate-to', (_, page) => {
  // Extrai path e query parameters
  const [path, query] = page.split('?');
  
  // Verifica se deve forçar recarregamento
  const forceReload = query && query.includes('fresh=true');
  
  // Carrega a página
  mainWindow.loadFile(`src/pages/${path}.html`).then(() => {
    if (forceReload) {
      // Força recarregamento limpo
      mainWindow.webContents.reloadIgnoringCache();
    }
  });
});