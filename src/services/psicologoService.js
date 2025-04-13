// src/services/psicologoService.js
const Psicologo = require('../database/tabelas/psicologo');

class PsicologoService {
    async buscarPsicologoPorCredenciais(usuario, senha) {
        try {
            const psicologo = await Psicologo.findOne({
                where: { usuario, senha }
            });
            return psicologo;
        } catch (error) {
            throw new Error('Erro ao buscar psicólogo: ' + error.message);
        }
    }
}

module.exports = new PsicologoService();