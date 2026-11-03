// ====== CONFIGURAÇÕES E BANCO DE DADOS ======
const EMAIL_CRIADOR = "admin@senai.br"; // Teu e-mail especial com acesso duplo!

let currentUser = null; 
let meusHistoricos = []; 
let emprestimosAtivos = []; 
let totalDevolvidosHoje = 0;

// ====== CONTROLE DE TELAS E AUTENTICAÇÃO ======
function switchAuth(tela) {
    if(tela === 'cadastro') {
        document.getElementById('box-login').classList.add('hide');
        document.getElementById('box-cadastro').classList.remove('hide');
    } else {
        document.getElementById('box-cadastro').classList.add('hide');
        document.getElementById('box-login').classList.remove('hide');
    }
}

function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function validarEmailGeral(email) {
    return email === EMAIL_CRIADOR || email.endsWith('@aluno.senai.br') || email.endsWith('@senai.prof.br') || email.endsWith('@sesisenaipr.org.br');
}

function isProfessor(email) {
    return email.endsWith('@senai.prof.br') || email.endsWith('@sesisenaipr.org.br');
}

// Oculta os campos de aula se for um e-mail de Professor/Criador
const inputEmail = document.getElementById('login-email');
const camposAula = document.getElementById('campos-aula');

inputEmail.addEventListener('input', (e) => {
    const emailDigitado = e.target.value.toLowerCase().trim();
    if (isProfessor(emailDigitado) || emailDigitado === EMAIL_CRIADOR) {
        camposAula.style.display = 'none';
        document.getElementById('login-turma').required = false;
        document.getElementById('login-aula').required = false;
        document.getElementById('login-prof').required = false;
    } else {
        camposAula.style.display = 'block';
        document.getElementById('login-turma').required = true;
        document.getElementById('login-aula').required = true;
        document.getElementById('login-prof').required = true;
    }
});

// Trava o campo "Turma" para estritamente: 1 Número + 1 Letra (ex: 1A, 2E)
const inputTurma = document.getElementById('login-turma');
inputTurma.addEventListener('input', (e) => {
    let val = e.target.value.toUpperCase();
    if (val.length >= 1 && !/[0-9]/.test(val[0])) val = "";
    if (val.length === 2 && !/[A-Z]/.test(val[1])) val = val[0];
    e.target.value = val.substring(0, 2);
});

// ====== EFETUAR LOGIN (AJSUTADO PARA O FORMULARIO) ======
function fazerLoginEvent(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.toLowerCase().trim();
    const erroMsg = document.getElementById('erro-login');

    if (!validarEmailGeral(email)) {
        erroMsg.style.display = 'block';
        return;
    }
    erroMsg.style.display = 'none';

    // 1. SE FOR A CONTA DO CRIADOR/MASTER
    if (email === EMAIL_CRIADOR) {
        currentUser = {
            email: email,
            nome: "Criador (Master)",
            turma: "ADM",
            aula: "Geral",
            prof: "Admin"
        };
        document.getElementById('box-master-switch').classList.remove('hide');
        document.getElementById('btn-master-to-admin').classList.remove('hide');
        mudarParaAdmin();
        return;
    }

    // 2. SE FOR PROFESSOR
    if (isProfessor(email)) {
        currentUser = {
            email: email,
            nome: email.split('@')[0],
            turma: "PROF",
            aula: "Docente",
            prof: "Professor"
        };
        document.getElementById('box-master-switch').classList.add('hide');
        document.getElementById('btn-master-to-admin').classList.add('hide');
        mudarParaAdmin();
        return;
    }

    // 3. SE FOR ALUNO NORMAL
    currentUser = {
        email: email,
        nome: email.split('@')[0],
        turma: document.getElementById('login-turma').value,
        aula: document.getElementById('login-aula').value,
        prof: document.getElementById('login-prof').value
    };

    document.getElementById('box-master-switch').classList.add('hide');
    document.getElementById('btn-master-to-admin').classList.add('hide');
    mudarParaAluno();
}

// ====== CADASTRO ======
document.getElementById('form-cadastro').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('cad-email').value.toLowerCase().trim();
    const senha = document.getElementById('cad-senha').value;
    const confirma = document.getElementById('cad-confirma').value;
    const erroMsg = document.getElementById('erro-cadastro');

    if (!validarEmailGeral(email)) {
        erroMsg.innerText = "Informe um e-mail educacional válido!";
        erroMsg.style.display = 'block';
        return;
    }
    if (senha !== confirma) {
        erroMsg.innerText = "As senhas não coincidem!";
        erroMsg.style.display = 'block';
        return;
    }
    
    erroMsg.style.display = 'none';
    alert("Cadastro realizado! Faça login com a sua conta.");
    switchAuth('login');
});

// ====== TRANSIÇÃO DE TELAS ======
function mudarParaAdmin() {
    document.getElementById('tela-auth').classList.remove('active');
    document.getElementById('tela-dashboard').classList.remove('active');
    document.getElementById('tela-admin').classList.add('active');
    atualizarPainelAdmin();
}

function mudarParaAluno() {
    if(currentUser) {
        document.getElementById('user-name-display').innerText = currentUser.nome;
        document.getElementById('user-class-display').innerText = `Turma ${currentUser.turma} - ${currentUser.aula}`;
    }
    document.getElementById('tela-auth').classList.remove('active');
    document.getElementById('tela-admin').classList.remove('active');
    document.getElementById('tela-dashboard').classList.add('active');
}

function fazerLogout() {
    currentUser = null;
    document.getElementById('form-login').reset();
    camposAula.style.display = 'block';
    document.getElementById('tela-dashboard').classList.remove('active');
    document.getElementById('tela-admin').classList.remove('active');
    document.getElementById('tela-auth').classList.add('active');
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('menu-overlay').classList.remove('show');
}

// ====== TELA DO PROFESSOR (ADMIN) ======
function atualizarPainelAdmin() {
    const lista = document.getElementById('admin-lista-pcs');
    document.getElementById('stat-em-uso').innerText = emprestimosAtivos.length;
    document.getElementById('stat-devolvidos').innerText = totalDevolvidosHoje;
    
    lista.innerHTML = '';

    if (emprestimosAtivos.length === 0) {
        lista.innerHTML = '<p style="color: var(--text-subtitle); text-align: center; margin-top: 40px; font-size: 13px;">Nenhum computador emprestado no momento.</p>';
        return;
    }

    emprestimosAtivos.forEach(emp => {
        lista.innerHTML += `
            <div class="admin-card">
                <strong>${emp.alunoNome} <span class="tag-pc">PC ${emp.pc}</span></strong>
                <p>
                    📚 <b>Turma:</b> ${emp.turma} | <b>Aula:</b> ${emp.aula}<br>
                    👨‍🏫 <b>Prof Resp:</b> ${emp.prof}<br>
                    ⏱️ <b>Retirado às:</b> ${emp.horaOut} ${emp.carregador ? '(C/ Carregador)' : ''}
                </p>
            </div>
        `;
    });
}

// ====== MENU LATERAL, MODAL E WHATSAPP ======
const sidebar = document.getElementById('sidebar');
const menuOverlay = document.getElementById('menu-overlay');
const modalHistorico = document.getElementById('modal-historico');

document.getElementById('open-menu').addEventListener('click', () => { sidebar.classList.add('open'); menuOverlay.classList.add('show'); });
document.getElementById('close-menu').addEventListener('click', () => { sidebar.classList.remove('open'); menuOverlay.classList.remove('show'); });
menuOverlay.addEventListener('click', () => { sidebar.classList.remove('open'); menuOverlay.classList.remove('show'); modalHistorico.classList.remove('show'); });

document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    document.getElementById('app-container').classList.toggle('light-mode');
    const txt = document.getElementById('theme-text');
    txt.innerText = document.getElementById('app-container').classList.contains('light-mode') ? 'Modo Escuro' : 'Modo Claro';
});

document.getElementById('btn-ajuda').addEventListener('click', () => { window.open(`https://wa.me/5511999999999?text=Ajuda com o sistema SENAI.`, '_blank'); });

// ====== HISTÓRICO ======
document.getElementById('btn-abrir-historico').addEventListener('click', () => {
    sidebar.classList.remove('open'); modalHistorico.classList.remove('hide');
    setTimeout(() => { modalHistorico.classList.add('show'); }, 10);
    renderizarHistorico();
});
document.getElementById('btn-close-historico').addEventListener('click', () => { modalHistorico.classList.remove('show'); menuOverlay.classList.remove('show'); });

function obterHoraAtual() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

function renderizarHistorico() {
    const lista = document.getElementById('lista-historico');
    lista.innerHTML = meusHistoricos.length === 0 ? '<li class="empty-msg" style="text-align: center; color: var(--text-subtitle); list-style: none;">Nenhum empréstimo realizado.</li>' : '';
    
    meusHistoricos.forEach(h => {
        const devolvido = h.horaIn ? 'devolvido' : '';
        const status = h.horaIn ? `Devolvido às ${h.horaIn}` : `⚠️ EM USO`;
        lista.innerHTML += `
            <li class="hist-item ${devolvido}">
                <b>PC ${h.pc}</b> ${h.carregador ? '⚡' : ''} - ${status}
                <span>Pegou às ${h.horaOut} | Prof: ${h.prof} (${h.aula})</span>
            </li>
        `;
    });
}

// ====== BOTÃO REGISTRAR / DEVOLVER ======
const btnAction = document.getElementById('btn-action');
const displayNum = document.getElementById('computer-number');
const inputPc = document.getElementById('manual-pc-input');
const checkCarregador = document.getElementById('carregador');
const toast = document.getElementById('toast');

let currentSessionId = null;

btnAction.addEventListener('click', () => {
    btnAction.disabled = true; 
    document.getElementById('btn-text').innerText = '...';

    setTimeout(() => {
        btnAction.disabled = false;
        
        if (!btnAction.classList.contains('cancelar')) {
            // REGISTRAR EMPRÉSTIMO
            let numPc = (inputPc.value && inputPc.value > 0) ? inputPc.value : Math.floor(Math.random() * 50) + 1;
            displayNum.innerText = numPc;
            document.getElementById('container-input-pc').classList.add('hide');
            
            currentSessionId = Date.now();
            const novoEmprestimo = {
                id: currentSessionId,
                pc: numPc,
                alunoNome: currentUser.nome,
                turma: currentUser.turma,
                aula: currentUser.aula,
                prof: currentUser.prof,
                horaOut: obterHoraAtual(),
                horaIn: null,
                carregador: checkCarregador.checked
            };

            meusHistoricos.unshift(novoEmprestimo); 
            emprestimosAtivos.push(novoEmprestimo);  
            
            document.getElementById('btn-text').innerText = 'DEVOLVER PC';
            btnAction.classList.add('cancelar');
            checkCarregador.disabled = true;
            
            toast.innerText = `PC ${numPc} Registrado!`; toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);

        } else {
            // DEVOLVER COMPUTADOR
            let registro = meusHistoricos.find(h => h.id === currentSessionId);
            if(registro) registro.horaIn = obterHoraAtual();

            emprestimosAtivos = emprestimosAtivos.filter(emp => emp.id !== currentSessionId);
            totalDevolvidosHoje++;

            displayNum.innerText = ''; inputPc.value = ''; currentSessionId = null;
            document.getElementById('container-input-pc').classList.remove('hide');
            
            document.getElementById('btn-text').innerText = 'REGISTRAR';
            btnAction.classList.remove('cancelar');
            checkCarregador.disabled = false; checkCarregador.checked = false;
            
            toast.innerText = 'Devolvido com sucesso.'; toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }, 600); 
});