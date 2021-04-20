const { response } = require('express');
const knex = require('../database/index');
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

module.exports = {
    
    async token(req, res){
        try {
            const id = 1; //esse id viria do banco de dados
            const token = jwt.sign({ id }, process.env.SECRET, {
                // expiresIn: 300 // expires in 5min
                expiresIn: 86400
            });
            return res.json({ auth: true, token: token });

        } catch (error) {
            return res.send("toke error");
        }
    },

    async login(req, res){
        const { usuario, senha } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
          
          // se tudo estiver ok, salva no request para uso posterior
          const res_id_cli = await knex.select('id').from('user_cliente').where('usuario', usuario);

          if(res_id_cli.length > 0){
            const response = await knex.select('id', 'nome', 'email','cpf', 'cnpj', 'telefone','celular')
            .from('user_cliente').where('usuario', usuario).where('senha', senha).where('status', 1);
            if(response.length > 0){

                return res.json({message:'Bem vindo.', status:200, data:response})
            }else{
                return res.json({message:'Usuario ou senha invalido.', status:500})
            }
          }else{
            return res.json({message:'Usuario não cadastrado.', status: 400})
          }
  
        });
    
    }
}
