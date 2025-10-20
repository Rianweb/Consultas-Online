
document.addEventListener('DOMContentLoaded', function() {
    // Verifica em qual página estamos para executar a função correta
    if (document.getElementById('formAgendamento')) {
        document.getElementById('formAgendamento').addEventListener('submit', salvarAgendamento);
        verificarModoEdicao();
    }

    if (document.getElementById('lista-consultas')) {
        carregarAgendamentos();
    }
});

function validarLogin(event) {
    event.preventDefault();
    const usuarioValido = "admin";
    const senhaValida = "12345";
    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("password");
    const mensagemErro = document.getElementById("msgErro");

    if (usuarioInput.value === usuarioValido && senhaInput.value === senhaValida) {
        window.location.href = "agendamento.html";
    } else {
        mensagemErro.textContent = "Usuário ou senha inválidos";
    }
}

function salvarAgendamento(event) {
    event.preventDefault();

    const editIndex = document.getElementById('editIndex')?.value;

    const agendamento = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        idade: document.getElementById('idade').value,
        data: document.getElementById('data').value,
        hora: document.getElementById('hora').value,
        especialidade: document.getElementById('especialidade').value,
        conveniado: document.querySelector('input[name="conveniado"]:checked')?.value,
        servicos: Array.from(document.querySelectorAll('input[name="servico"]:checked')).map(cb => cb.value),
        sintomas: document.getElementById('sintomas').value,
        medico: document.getElementById('medico').value
    };
    
    // Validação de data passada
    const dataConsulta = new Date(agendamento.data + 'T' + agendamento.hora);
    if (dataConsulta < new Date() && editIndex === undefined) {
        alert("A data da consulta não pode ser no passado.");
        return;
    }

    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

    if (editIndex !== undefined && editIndex !== '') {
        // Atualiza o agendamento existente
        agendamentos[editIndex] = agendamento;
        alert("Agendamento atualizado com sucesso!");
    } else {
        // Adiciona um novo agendamento
        agendamentos.push(agendamento);
        alert("Consulta agendada com sucesso!");
    }

    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    // Redireciona para a lista após salvar ou editar
    window.location.href = 'lista.html';
}

function carregarAgendamentos() {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const tabela = document.getElementById('lista-consultas');
    tabela.innerHTML = '';

    if (agendamentos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="5">Nenhuma consulta agendada.</td></tr>';
        return;
    }

    agendamentos.forEach((agendamento, index) => {
        const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        
        const row = `
            <tr>
                <td>${agendamento.nome}</td>
                <td>${dataFormatada}</td>
                <td>${agendamento.hora}</td>
                <td>${agendamento.especialidade.replace(/_/g, ' ')}</td>
                <td class="actions-cell">
                    <button class="btn-action btn-edit" onclick="editarAgendamento(${index})">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="excluirAgendamento(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tabela.innerHTML += row;
    });
}

function editarAgendamento(index) {
    // Armazena o índice no sessionStorage para que a outra página possa acessá-lo
    sessionStorage.setItem('editIndex', index);
    window.location.href = 'agendamento.html';
}

function excluirAgendamento(index) {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        agendamentos.splice(index, 1); 
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        carregarAgendamentos(); 
    }
}

function verificarModoEdicao() {
    const editIndex = sessionStorage.getItem('editIndex');
    if (editIndex !== null) {
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        const agendamentoParaEditar = agendamentos[editIndex];

        // Preenche o formulário com os dados existentes
        document.getElementById('nome').value = agendamentoParaEditar.nome;
        document.getElementById('email').value = agendamentoParaEditar.email;
        document.getElementById('telefone').value = agendamentoParaEditar.telefone;
        document.getElementById('idade').value = agendamentoParaEditar.idade;
        document.getElementById('data').value = agendamentoParaEditar.data;
        document.getElementById('hora').value = agendamentoParaEditar.hora;
        document.getElementById('especialidade').value = agendamentoParaEditar.especialidade;
        document.getElementById('sintomas').value = agendamentoParaEditar.sintomas;
        document.getElementById('medico').value = agendamentoParaEditar.medico;

        if (agendamentoParaEditar.conveniado) {
            document.querySelector(`input[name="conveniado"][value="${agendamentoParaEditar.conveniado}"]`).checked = true;
        }

        agendamentoParaEditar.servicos.forEach(servico => {
            document.querySelector(`input[name="servico"][value="${servico}"]`).checked = true;
        });

        // Adiciona um campo oculto para saber que estamos em modo de edição ao salvar
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'editIndex';
        hiddenInput.value = editIndex;
        document.getElementById('formAgendamento').appendChild(hiddenInput);

        // Limpa o índice do sessionStorage
        sessionStorage.removeItem('editIndex');
    }
}