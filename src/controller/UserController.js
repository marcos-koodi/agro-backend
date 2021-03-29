const { response } = require('express');
const knex = require('../database/index');
const jwt = require("jsonwebtoken");

module.exports = {
    async index(req, res){
        try {
            const response = await knex.select('*').from('user_cliente');
            return res.json(response);
        } catch (error) {
            return res.json({teste:"teste"});
        }
    },


    async create(req, res){
        const {nome, email, cpf, telefone } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            
            // se tudo estiver ok, salva no request para uso posterior
            const response = await knex.select('id', 'status').from('user_cliente').where('cpf', cpf);

            if(response.length > 0){
                var msg='Usuario já cadastrado.';
                if(response[0]['status'] == 0){
                    msg ="Aguarde aprovação do cadastro.";
                }else if(response[0]['status'] == 2){
                    msg ="Usuario já cadastrado, entre em contato com administrador.";
                }

                return res.json({message: msg, status: 500});
            }else{

                const response = await knex('user_cliente').insert({nome, email, cpf, telefone});

                if(response.length > 0){
                    console.log("Certo ao cadastrar");
                    return res.json({message: 'Cadastrado com sucesso!', status:200, data: response})
                }else{
                    console.log("Error ao cadastrar");
                    return res.send({message: 'Erro ao cadastrar...',status:400, data: error});
                }
                // const response = await knex.select('id', 'nome', 'email','cpf', 'cnpj', 'telefone','celular', 'avatar')
                // .from('user_cliente').where('usuario', usuario).where('senha', senha);
                // if(response.length > 0){
    
                //     return res.json({message:'Bem vindo.', status:200, data:response})
                // }else{
                //     return res.json({message:'Senha invalida.', status:500})
                // }
              }
        });
        // try {
            // const response = await knex('user_cliente').insert({nome, email, cpf, telefone});
            // return res.json(response)
        // } catch (error) {
        //     console.log(error);
        // }
    },

    async getConsorcios(req, res){
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const response = await knex.select('*').from('consorcios').where('status', 1);

                

                // for(let i = 0; i < response.length ; i++){
                //     var base64data = Buffer.from(response[i].icone, 'blob').toString('base64');
                //     response[i]['icone'] = base64data;
                // }

               return res.json({data:response, status: 200,message:"Carregando consórcios"});
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os consórcios"});
            }
        });
    },
    async listaDocsCli(req, res){
        const token = req.headers['x-access-token'];
        const {id_cliente_servico} = req.body;
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const resIDsHerdeiros = await knex.select('id_cliente','herdeiro_1', 'herdeiro_2' ).from('cliente_servico').where('id', id_cliente_servico);
                let resDataHerdeiros=[];
                var resId_cliente_servico_etapa;
                var documentos_cliente_servico_etapa;
                var temp;
                var index=0;
                if(resIDsHerdeiros[0]['id_cliente'] !=null){
                    await getListDocs(resIDsHerdeiros[0]['id_cliente'], id_cliente_servico);
                }
                if(resIDsHerdeiros[0]['herdeiro_1'] !=null){
                    await getListDocs(resIDsHerdeiros[0]['herdeiro_1'], id_cliente_servico);
                };
                if(resIDsHerdeiros[0]['herdeiro_2'] != null){
                    await getListDocs(resIDsHerdeiros[0]['herdeiro_2'], id_cliente_servico);

                };
                async function getListDocs(id, id_cliente_servico) {
                    temp = await knex.select('id','nome' ).from('user_cliente').where('id', id);
                    resDataHerdeiros.push(temp[0]);

                    // const lista = await knex.select('td.id AS id_doc','td.tipo','td.nome AS nome_doc').from('documentos_etapa AS de')
                    // .innerJoin('tipo_documento AS td','td.id','de.id_documento').where('de.id_etapa',etapa).where('td.setor', 'Pessoal').orderBy('de.id');
                    // console.log("Lista doc: ",JSON.stringify(lista));
               
                    const listComStatus = await knex.select('docCli.id', 'docCli.id_cliente', 'docCli.tipo_doc', 'docCli.status', 'tpDoc.id AS tipo_doc','tpDoc.nome', 'tpDoc.tipo', 'tpDoc.setor')
                    .from('documentos_cliente AS docCli').innerJoin('tipo_documento AS tpDoc ', 'tpDoc.id','docCli.tipo_doc')
                    .where('id_cliente', id).where('tpDoc.setor','Pessoal');
                    
                    
                    resId_cliente_servico_etapa = await knex.select('id').from('cliente_servico_etapa')
                    .where('id_cliente_servico', id_cliente_servico)
                    .where('etapa',1);

                    documentos_cliente_servico_etapa = await knex.select('docsEtp.status', 'docsEtp.tipo_doc', 'tpDoc.nome','tpDoc.setor', 'tpDoc.tipo', 'docsEtp.id_cliente_servico_etapa')
                    .from('documentos_cliente_servico_etapa AS docsEtp')
                    .innerJoin('tipo_documento AS tpDoc', 'tpDoc.id', 'docsEtp.tipo_doc')
                    .where('docsEtp.id_cliente', id)
                    .where('docsEtp.id_cliente_servico_etapa',resId_cliente_servico_etapa[0]['id'])
                    .where('tpDoc.setor', 'Pessoal');
                    //  ^retorna -->    {
                    //         "status": 2,
                    //         "tipo_doc": "7",
                    //         "nome": "Certidão de Matricula do Bem",
                    //         "setor": "Pessoal",
                    //         "tipo": 0,
                    //         "id_cliente_servico_etapa": 5
                    //     }
                    
                    let id_docsEtp = documentos_cliente_servico_etapa.map((docEtp)=>{
                        return docEtp.tipo_doc
                    })

                    let id_doc = listComStatus.map((item) =>{
                        return item.tipo_doc
                    });

                    const listSemStatus = await knex.select('*').from('tipo_documento')
                    .whereNotIn('id',id_doc).whereNotIn('id',id_docsEtp)
                    .where('setor','Pessoal');

                    let tp_lista =[];
                    await listSemStatus.forEach((item)=>{
                        tp_lista.push({
                            "id": null,
                            "id_cliente": temp[0].id,
                            "tipo_doc": item.id,
                            "status": 0,
                            "nome": item.nome,
                            "tipo": item.tipo,
                            "setor": item.setor
                        });
                    });

                    resDataHerdeiros[index]['lista_docPessoal'] = tp_lista;
                    // resDataHerdeiros[index]['lista_sem'] = listSemStatus;
                    listComStatus.forEach((value)=>{
                        resDataHerdeiros[index]['lista_docPessoal'].push(value);
                    });
                    documentos_cliente_servico_etapa.forEach((docEtp)=>{
                        resDataHerdeiros[index]['lista_docPessoal'].push(docEtp);
                    });

                    index +=1;
                }
                index = 0;
                
                return res.json(resDataHerdeiros);
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os clientes e documentos peossoais"});
            };
        });
    },
    async listDocPropriedade(req, res){
        const token = req.headers['x-access-token'];
        const {id_cliente_servico} = req.body;
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const resId_cliente_servico = await knex.select('id' ).from('cliente_servico').where('id', id_cliente_servico);
                const resId_cliente_servico_etapa = await knex.select('id').from('cliente_servico_etapa').where('id_cliente_servico', resId_cliente_servico[0]['id'])
                .where('etapa', 1);

                // id`, `id_cliente`, `id_cliente_servico_etapa`, `tipo_doc`, `documento`, `status`
                console.log("resId_cliente_servico: ", resId_cliente_servico);
                console.log("resId_cliente_servico_etapa: ", resId_cliente_servico_etapa);
                
                // status, tipo_doc, nome, setor, 
                const listDocPropriedade = await knex.select('docsEtp.status', 'docsEtp.tipo_doc', 'tpDoc.nome','tpDoc.setor', 'tpDoc.tipo', 'docsEtp.id_cliente_servico_etapa')
                .from('documentos_cliente_servico_etapa AS docsEtp')
                .innerJoin('tipo_documento AS tpDoc', 'tpDoc.id', 'docsEtp.tipo_doc')
                .where('docsEtp.id_cliente_servico_etapa',resId_cliente_servico_etapa[0]['id']).where('tpDoc.setor', 'Propriedade');


                let id_docs_send = listDocPropriedade.map((item) =>{
                    return item.tipo_doc
                });
                
                const docPropriedade = await knex.select('td.id AS id_doc','td.tipo', 'td.nome AS nome_doc','td.setor')
                .from('documentos_etapa AS de')
                .innerJoin('tipo_documento AS td', 'td.id','de.id_documento')
                .where('de.id_etapa', 1).whereNotIn('td.id',id_docs_send).where('td.setor', 'Propriedade');


                
                let tp_listaProp =[];
                await docPropriedade.forEach((item)=>{
                    tp_listaProp.push({

                        "status": 0,
                        "tipo_doc": item.id_doc,
                        "nome": item.nome_doc,
                        "setor": item.setor,
                        "tipo": item.tipo,
                        "id_cliente_servico_etapa": resId_cliente_servico_etapa[0]['id']
                    });
                });

                // resDataHerdeiros[index]['lista_docPessoal'] = tp_lista;
                listDocPropriedade.forEach((value)=>{
                    tp_listaProp.push(value);
                });
                
                return res.json(tp_listaProp);
               
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os documentos de propriedade"});
            };
        });
    },
    async docsEtapas(req,res){
        const token = req.headers['x-access-token'];

        const {id_cliente_servico, etapa} = req.body;

        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const resId_cliente_servico = await knex.select('id').from('cliente_servico').where('id', id_cliente_servico);
                const resId_cliente_servico_etapa = await knex.select('id').from('cliente_servico_etapa').where('id_cliente_servico', resId_cliente_servico[0]['id'])
                .where('etapa', etapa);

                // var doc = await knex.select('*').from('cliente_servico_etapa AS csa').where()
                // console.log("resId_cliente_servico: ", resId_cliente_servico);
                // console.log("resId_cliente_servico_etapa: ", resId_cliente_servico_etapa);
                // documentos_cliente_servico_etapa
                const listDocPropriedade = await knex.select('docsEtp.id AS id_doc_cse','docsEtp.status', 'docsEtp.tipo_doc', 'tpDoc.nome','tpDoc.setor', 'tpDoc.tipo', 'docsEtp.id_cliente_servico_etapa')
                .from('documentos_cliente_servico_etapa AS docsEtp')
                .innerJoin('tipo_documento AS tpDoc', 'tpDoc.id', 'docsEtp.tipo_doc')
                // .innerJoin('cliente_servico_etapa AS cse','docsEtp.id_cliente_servico_etapa','cse.id')
                .where('docsEtp.id_cliente_servico_etapa',resId_cliente_servico_etapa[0]['id']);

                let id_docs_send = listDocPropriedade.map((item) =>{
                    return item.tipo_doc
                });
                
                const docPropriedade = await knex.select('td.id AS id_doc','td.tipo', 'td.nome AS nome_doc','td.setor')
                .from('documentos_etapa AS de')
                .innerJoin('tipo_documento AS td', 'td.id','de.id_documento')
                .where('de.id_etapa', etapa)
                .whereNotIn('td.id', id_docs_send);
                // .where('td.setor', 'Propriedade');

                
                let tp_listaProp =[];
                await docPropriedade.forEach((item)=>{
                    tp_listaProp.push({
                        "status": 0,
                        "tipo_doc": item.id_doc,
                        "nome": item.nome_doc,
                        "setor": item.setor,
                        "tipo": item.tipo,
                        "id_cliente_servico_etapa": resId_cliente_servico_etapa[0]['id'],
                        // "doc_admin": resId_cliente_servico_etapa[0]['doc_admin']
                    });
                });

                listDocPropriedade.forEach((value)=>{
                    tp_listaProp.push(value);
                });

                return res.json(tp_listaProp);
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os documentos da etapa"});
            };
        });
    },
    async docLaudo(req, res){
        const token = req.headers['x-access-token'];

        const {id_cliente_servico} = req.body;

        let laudo ={
            "status":0,
            "id_cliente_servico_etapa":null,
        };
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const resId_cliente_servico_etapa = await knex.select('id', 'doc_admin').from('cliente_servico_etapa')
                .where('id_cliente_servico', id_cliente_servico)
                .where('etapa', 4);

                if(resId_cliente_servico_etapa[0]['doc_admin'] == null){
                    laudo ={
                        "status":0,
                        "id_cliente_servico_etapa":resId_cliente_servico_etapa[0]['id'],
                    };
                }else if(resId_cliente_servico_etapa[0]['doc_admin']){
                    laudo ={
                        "status":1,
                        "id_cliente_servico_etapa":resId_cliente_servico_etapa[0]['id'],
                    };
                }
 
                return res.json(laudo);
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar a visita"});
            };
        });
    },
    async docVisita(req,res){
        const token = req.headers['x-access-token'];

        const {id_cliente_servico, etapa} = req.body;

        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const resId_cliente_servico = await knex.select('id').from('cliente_servico').where('id', id_cliente_servico);
 
                // documentos_cliente_servico_etapa AS docsEtp
                const listDocPropriedade = await knex.select('visita.data','visita.horario', 'visita.endereco', 'visita.status')
                .from('visitas_cliente_servico_etapa AS visita')
                .innerJoin('cliente_servico_etapa AS cse', 'visita.id_cliente_servico_etapa', 'cse.id')
                .where('cse.id_cliente_servico',resId_cliente_servico[0]['id'])
                .where('cse.etapa', 3);


                return res.json(listDocPropriedade);
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar a visita"});
            };
        });
    },
    async isCpf(req, res){
        const {cpf } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const response = await knex.select('id', 'cpf').from('user_cliente').where('cpf', cpf).where('status', 1);
                if(response.length > 0){
                    return res.json({data:response, status: 200,message:"Carregando CPF"});
                }else{
                    return res.json({data:response, status: 540,message:"CPF do usuário em análise."});
                }
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os cpf"});
            }
        });
    },
    async cadServico(req, res){
        const { id_cliente, herdeiro_1, herdeiro_2, id_servico} = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            
            const id_cliente_servico = await knex('cliente_servico').insert({id_cliente, herdeiro_1, herdeiro_2, id_servico}).returning('id');

            const resEtapas = await knex('etapa_servico').select('etapa').where('id_servico',id_servico );
            for(i =1; i <= resEtapas.length; i++ ){
                console.log(i);
                var etapa = i;
                var response = await knex('cliente_servico_etapa').insert({id_cliente_servico, etapa});
            }

            if(response.length > 0){
                console.log("Certo ao cadastrar servico");
                return res.json({message: 'Serviço cadastrado com sucesso!', status:200, id_cliente_servico:id_cliente_servico, data: response})
            }else{
                console.log("Error ao cadastrar");
                return res.send({message: 'Erro ao cadastrar...',status:400, data: error});
            }          
        });
    },
    async listEtapa(req, res){
        const { id_cliente_servico } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

            const response = await knex('cliente_servico AS cs').select('cs.id as id_cliente_servico', 'cse.etapa', 'cse.status as status_etapa', 'e.id as id_etapa', 'e.nome as nome_etapa')
            .innerJoin('cliente_servico_etapa as cse', 'cs.id', 'cse.id_cliente_servico')
            .innerJoin('servicos AS s', 'cs.id_servico', 's.id')
            .innerJoin('etapa_servico AS es', function() {
                this.on('cs.id_servico', '=', 'es.id_servico').andOn('cse.etapa', '=', 'es.etapa')
              })
            .innerJoin('etapas as e', 'es.id_etapa', 'e.id')
            .where('cs.id', id_cliente_servico);

            if(response.length > 0){
                console.log("Carregando etapas.");
                return res.json({message: 'Carregando etapas.', status:200, data: response})
            }else{
                console.log("Error ao cadastrar");
                return res.send({message: 'Erro ao carregar etapas...',status:400, data: error});
            }          
        });
    },

    async seusPlanos(req, res){
        const {id_cliente } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const response = await knex.select('cs.id as id_cliente_servico', 'cs.id_servico AS id_servico', 'cs.herdeiro_1',
                    'cs.herdeiro_2', 's.nome AS nome_servico', 'cs.data_cad', 'cse.etapa', 'cse.status')
                    .from('cliente_servico AS cs')
                    .innerJoin('cliente_servico_etapa as cse', 'cs.id', 'cse.id_cliente_servico')
                    .innerJoin('servicos AS s', 'cs.id_servico', 's.id')
                    .where(function() {
                        this.where('cse.status', 1).orWhere('cse.status', 0)
                      })
                    // .where('cse.status',1, OR, 'cse.status', 0)
                    .where('cs.id_cliente', id_cliente)
                    .groupBy('cse.id_cliente_servico');
                if(response.length > 0){
                    return res.json({data:response, status: 200,message:"Carregando os planos"});
                }else{
                    return res.json({data:response, status: 540,message:"Sem planos em andamento"});
                }
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os cpf"});
            }
        });
    },
    // SELCT "seus planos"
    // SELECT
        // cs.id as id_cliente_servico,
        // cs.id_servico AS id_servico,
        // cs.herdeiro_1,
        // cs.herdeiro_2,
        // s.nome AS nome_servico,
        // cs.data_cad,
        // cse.etapa,
        // cse.status
    // FROM 
    //     cliente_servico AS cs
    // INNER JOIN 
    //     cliente_servico_etapa as cse
    //     ON cs.id = cse.id_cliente_servico
    // INNER JOIN 
    //      servicos AS s
    //     ON cs.id_servico = s.id
    // WHERE (cse.status = 1 OR cse.status = 0)
    //     AND cs.id_cliente=$id_cliente_aberto
    //     GROUP BY
    //         cse.id_cliente_servico

    
    async cadDocCliente(req, res){
        const { id_cliente, tipo_doc, documento, tipo, id_cliente_servico, etapa } = req.body;

        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            if(tipo ==1){
                const response = await knex('documentos_cliente').insert({id_cliente, tipo_doc, documento});
                if(response.length > 0){
                    console.log("Doc Cadastrado .");
                    return res.json({message: 'documentos_cliente cadastrado com sucesso.', status:200, data: response})
                }else{
                    console.log("Error ao cadastrar doc");
                    return res.send({message: 'Erro ao cadastrar documentos_cliente...',status:400, data: error});
                }
            }else{
                const id_cliente_servico_etapa = await knex('cliente_servico_etapa').select('id').where('id_cliente_servico', id_cliente_servico).where('etapa', etapa);
                console.log("id_cliente_servico_etapa", id_cliente_servico_etapa[0]);
                const response = await knex('documentos_cliente_servico_etapa').insert({id_cliente, tipo_doc, documento, id_cliente_servico_etapa:id_cliente_servico_etapa[0]['id']});
                if(response.length > 0){
                    console.log("Doc Cadastrado.");
                    return res.json({message: 'documentos_cliente cadastrado com sucesso.', status:200, data: response})
                }else{
                    console.log("Error ao cadastrar doc");
                    return res.send({message: 'Erro ao cadastrar documentos_cliente...',status:400, data: error});
                }
            }
        });
    },

    async update(req, res){
        const {id, nome, usuario,senha,email, cpf, cnpj, telefone, celular, avatar, status} = req.body;
        try {
            const response = await knex('user_cliente').update({nome, usuario,senha,email, cpf, cnpj, telefone, celular, avatar, status}).where('id', '=', id)
            return res.json("Alterado com sucesso!")
            
        } catch (error) {
            
        }
        return res.send("Error");
    },
    async delete(req, res){
        const {id} = req.body;
        try {
            const response = await knex('user_cliente').delete().where('id', '=', id)
            return res.json("Deletado com sucesso!")
            
        } catch (error) {
            
        }
        return res.send("Error");
    }
}