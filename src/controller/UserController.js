const { response } = require('express');
const knex = require('../database/index');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const moment = require('moment');
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
                    msg =" Usuario já cadastado. Aguarde aprovação do cadastro.";
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
                const response = await knex.select('id', 'titulo', 'subtitulo', 'icone','imagem', 'descricao').from('consorcios').where('status', 1);
                
                for(let i = 0; i < response.length ; i++){
                    const base64 = String.fromCharCode.apply(null, new Uint16Array(response[i].icone));
                    response[i]['icone'] = base64;

                    /**
                     * Trazar imagem do consorcio, tirar para proxima versão
                     */
                    try {
                        let imagem = new Uint8Array(response[i].imagem).reduce(function (data, byte) {
                            return data + String.fromCharCode(byte);
                        }, '');

                        response[i]['imagem'] = imagem;
                    } catch (error) {
                        console.log(error)
                    }

                }

               return res.json({data:response, status: 200,message:"Carregando consórcios"});
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os consórcios"});
            }
        });
    },
    
    async getImagemConsorcio(req, res){
        const token = req.headers['x-access-token'];
        const { id_consorcio } = req.body;
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                console.log("id_consorcio: ", id_consorcio);
                const response = await knex.select('imagem').from('consorcios').where('id', id_consorcio);
                console.log("RESPONSe 1: ", response);
                // for(let i = 0; i < response.length ; i++){
                //     const base64 = String.fromCharCode.apply(null, new Uint16Array(response[i].icone));
                //     response[i]['icone'] = base64;

                    try {
                        let imagem = new Uint8Array(response[0]['imagem']).reduce(function (data, byte) {
                            return data + String.fromCharCode(byte);
                        }, '');

                        response[0]['imagem'] = imagem;
                    } catch (error) {
                        console.log(error)
                    }

                // }

               return res.json({data:response, status: 200,message:"Carregando imagem do consórcio"});
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar a imagem do consórcio"});
            }
        });
    },

    async getServicos(req, res){
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                let response = await knex.select('*').from('servicos').where('status', 1).orderBy('nome');
                
                for(let i = 0; i < response.length ; i++){
                    const base64 = String.fromCharCode.apply(null, new Uint16Array(response[i].icone));
                    response[i]['icone'] = base64;

                    /**try {
                        let imagem = new Uint8Array(response[i].icone).reduce(function (data, byte) {
                            return data + String.fromCharCode(byte);
                        },'');
                        response[i]['icone'] = imagem;
                    } catch (error) {
                        console.log(error)
                    }*/
                }
                    
                /*let listServico = [];

                response.forEach(function(item, index){
                  if(item.id == 14 || item.id == 3){
                    listServico.push(item);
                    response.splice(index, 1);
                  }
                });
                
                response = listServico.concat(response);*/

               return res.json({data:response, status: 200,message:"Carregando servicos"});
            } catch (error) {
                return res.json({data:error, status: 400, message:"Não foi possivel carregar os servicos"});
            }
        });
    },

    async getSliderPrincipal(req, res){
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                var slider = [];
                const response = await knex.select('*').from('slider');
                if(response.length > 0){
                    response.forEach(async(slide)=>{
                        await convertB64(slide.img);
                    });

                    function convertB64(img) {
                        try {
                            let imagem = new Uint8Array(img).reduce(function (data, byte) {
                                return data + String.fromCharCode(byte);
                            }, '');
                            slider.push(imagem);
                        } catch (error) {
                            console.log(error);
                        }
                    }

                    return res.json({data:slider, status: 200,message:"Carregando slides"});
                }else{
                    return res.json({data:response, status: 500,message:"Não tem slides disponiveis."});
                }


            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os slides"});
            }
        });
    },

    async getSliderLink(req, res) {
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function (err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                var response = await knex.select('*').from('slider');
                if (response.length > 0) {

                    for (let i = 0; i < response.length; i++) {
                        response[i].img = await convertB64(response[i]['img']);
                    }

                    function convertB64(img) {
                        try {
                            let imagem = new Uint8Array(img).reduce(function (data, byte) {
                                return data + String.fromCharCode(byte);
                            }, '');
                            return imagem;
                        } catch (error) {
                            console.log(error);
                            return '';
                        }
                    }

                    return res.json({ data: response, status: 200, message: "Carregando slides" });
                } else {
                    return res.json({ data: response, status: 500, message: "Não tem slides disponiveis." });
                }

            } catch (error) {
                return res.json({ data: error, status: 400, message: "Não foi possivel carregar os slides" });
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
                    temp = await knex.select('id','nome','avatar').from('user_cliente').where('id', id);
                    try {
                        let avatar = new Uint8Array(temp[0].avatar).reduce(function (data, byte) {
                            return data + String.fromCharCode(byte);
                        }, '');

                        temp[0]['avatar'] = avatar;
                    } catch (error) {
                        console.log(error);
                        temp[0]['avatar'] = null;
                    }

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

                    documentos_cliente_servico_etapa = await knex.select('docsEtp.status', 'docsEtp.tipo_doc', 'tpDoc.nome','tpDoc.setor', 'tpDoc.tipo', 'docsEtp.id_cliente_servico_etapa', 'docsEtp.id')
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
                // const resId_cliente_servico = await knex.select('id' ).from('cliente_servico').where('id', id_cliente_servico);
                // const resId_cliente_servico_etapa = await knex.select('id').from('cliente_servico_etapa').where('id_cliente_servico', resId_cliente_servico[0]['id']).where('etapa', 1);
                
                const resId_cliente_servico_etapa = await knex.select('id').from('cliente_servico_etapa')
                .where('id_cliente_servico', id_cliente_servico)
                .where('etapa', 1);

                // id`, `id_cliente`, `id_cliente_servico_etapa`, `tipo_doc`, `documento`, `status`
                // console.log("resId_cliente_servico: ", resId_cliente_servico);
                console.log("resId_cliente_servico_etapa: ", resId_cliente_servico_etapa);
                
                // status, tipo_doc, nome, setor, 
                const listDocPropriedade = await knex.select('docsEtp.status', 'docsEtp.tipo_doc', 'tpDoc.nome','tpDoc.setor', 'tpDoc.tipo', 'docsEtp.id_cliente_servico_etapa', 'docsEtp.id')
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
    
    async dadosProcessoEtapa(req,res){
        const token = req.headers['x-access-token'];

        const {id_cliente_servico, etapa, id_etapa} = req.body;

        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                // const resId_cliente_servico = await knex.select('id').from('cliente_servico').where('id', id_cliente_servico);
                const res_cliente_servico_etapa = await knex.select('id','adicional','orc_equipamentos', 'orc_recursos', 'status_processo_interno').from('cliente_servico_etapa')
                .where('id_cliente_servico', id_cliente_servico)
                .where('etapa', etapa);

                var processoEtapa = {
                    "id_cliente_servico": id_cliente_servico,
                    "etapa": etapa,
                    "id_etapa": id_etapa,
                    "status_processo_interno":res_cliente_servico_etapa[0]['status_processo_interno'],
                    "adicional":res_cliente_servico_etapa[0]['adicional'],

                    "orc_equipamentos":res_cliente_servico_etapa[0]['orc_equipamentos'],
                    "orc_recursos":res_cliente_servico_etapa[0]['orc_recursos'],

                    "id_cliente_servico_etapa": res_cliente_servico_etapa[0]['id'],

                    "doc":[{
                        "id_doc_cse":null, //id do documento do cliente
                        "status":null,
                        "tipo_doc": null, //id_doc
                        "nome": null,
                        "setor": null,
                        "tipo": null,
                    }]
                };

                var listDocPropriedade="";
                var docPropriedade=""

                /**verifica se a Etapa Requer Documento 
                        Etapas que REQUER DOCUMENTO : 2, 5, , 11   id_etapa == 10 ||*/
                if(id_etapa == 2 || id_etapa == 5 || id_etapa == 11){

                    // Verifica e Retorna o stts do(s) Doc(s) da Etapa já anexados.:
                    listDocPropriedade = await knex.select(
                    'docsEtp.id AS id_doc_cse','docsEtp.status', 'docsEtp.tipo_doc', 'docsEtp.id_cliente_servico_etapa', /*TB documentos_cliente_servico_etapa*/
                    'tpDoc.nome','tpDoc.setor', 'tpDoc.tipo') /*TB tipo_documento*/
                    .from('documentos_cliente_servico_etapa AS docsEtp')
                    .innerJoin('tipo_documento AS tpDoc', 'tpDoc.id', 'docsEtp.tipo_doc')
                    // .innerJoin('cliente_servico_etapa AS cse','docsEtp.id_cliente_servico_etapa','cse.id')
                    .where('docsEtp.id_cliente_servico_etapa',res_cliente_servico_etapa[0]['id']);
                            /**Retorna ==> {
                                    "id_doc_cse": 2,
                                    "status": 1,
                                    "tipo_doc": "29",
                                    "nome": "Cédula Reconhecida",
                                    "setor": "Cédula",
                                    "tipo": 2,
                                    "id_cliente_servico_etapa": 10
                                }*/


                    // Retorno os IDs do(s) Doc(s) já anexados.:
                    let id_docs_send = listDocPropriedade.map((item) =>{
                        return item.tipo_doc
                    });
                    console.log("id_docs_send: ", id_docs_send);

                    //Retorna as Informaçoes do(s) Doc(s) da Etapa.:
                    docPropriedade = await knex.select('td.id AS id_doc','td.tipo', 'td.nome AS nome_doc','td.setor')
                    .from('documentos_etapa AS de')
                    .innerJoin('tipo_documento AS td', 'td.id','de.id_documento')
                    .where('de.id_etapa', id_etapa)
                    .whereNotIn('td.id', id_docs_send);
                    // .where('td.setor', 'etapa');
                        /**Retorna ==>{
                            "id_doc": 30,
                            "tipo": 0,
                            "nome_doc": "Orçamento Cliente",
                            "setor": "Orcamento"
                        } */

                    processoEtapa.doc = [];
                    // var tp_listaProp =[];
                    await docPropriedade.forEach((item)=>{
                        processoEtapa.doc.push({
                            "id_doc_cse":null,
                            "status": 0,
                            "tipo_doc": item.id_doc,
                            "nome": item.nome_doc,
                            "setor": item.setor,
                            "tipo": item.tipo,
                            // "id_cliente_servico_etapa": resId_cliente_servico_etapa[0]['id'],
                            // "doc_admin": resId_cliente_servico_etapa[0]['doc_admin']
                        });
                    });

                    // console.log("tp_listaProp: ", tp_listaProp)
                    listDocPropriedade.forEach(async(value)=>{
                        await processoEtapa.doc.push(value);
                    });
                    if(id_etapa == 2 && processoEtapa.doc[0].status != 2){
                        const res_isDoc = await knex.select('doc_admin').from('cliente_servico_etapa')
                        .where('id_cliente_servico', id_cliente_servico)
                        .where('etapa', etapa);
                        if(res_isDoc[0]['doc_admin'] != null){
                            console.log("is Doc: ", res_isDoc);

                            processoEtapa.doc[0].status = 1
                        }
                    }
                    // processoEtapa.doc = tp_listaProp[0];
                }
                else if(id_etapa == 10){
                    const res_docLaudo = await knex.select('id', 'doc_admin').from('cliente_servico_etapa')
                    .where('id_cliente_servico', id_cliente_servico)
                    .where('etapa', 4);
                    if(res_docLaudo[0]['doc_admin'] == null){
                        processoEtapa.status_processo_interno = 0;
                    }else if(res_docLaudo[0]['doc_admin']){
                        processoEtapa.status_processo_interno = 2;
                    }
                }

                return res.json(processoEtapa);

                // return res.json(tp_listaProp); bkp Primeira versão 
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
                        // "tipo":2
                    };
                }
 
                return res.json(laudo);
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar a visita"});
            };
        });
    },

    async downloadArquivos(req, res){
        const token = req.headers['x-access-token'];
        const { id_doc, tipo, tabela_doc } = req.body;
        // console.log("Vem terminar a função!!!");
        console.log("Tipo ", tipo);

        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                // const response = await knex.select('*').from(tabela_doc)
                // .where('id', id_doc);
                let arquivo = "";
                if(tabela_doc == "cliente_servico_etapa"){
                    console.log("TABELA: cliente_servico_etapa");
                    const response = await knex.select('*').from('cliente_servico_etapa')
                    .where('id', id_doc);

                    arquivo = response[0]['doc_admin'];
                    console.log("response: ", response);

                    console.log("arq: ", arquivo);

                }else if(tabela_doc == "orcamento_cliente_servico_etapa"){
                    console.log("TABELA: orcamento_cliente_servico_etapa");

                    const res_doc = await knex.select('*').from('orcamento_cliente_servico_etapa')
                    .where('id', id_doc);

                    arquivo = res_doc[0]['doc'];

                    console.log("arq: ", arquivo);
                }else{
                    // tabela_doc == "documentos_cliente_servico_etapa"
                    if(tipo == 1){
                        console.log("Tabela tipo 1");
                        const response = await knex.select('*').from('documentos_cliente')
                        .where('id', id_doc);
                        // arquivo = new Uint8Array(response[0]['documento']).reduce(function (data, byte) {
                        //     return data + String.fromCharCode(byte);
                        // }, '');
                        arquivo = response[0]['documento'];
                    }else if(tipo == 0){
                        console.log("Tabela tipo 0");

                        // documentos_cliente_servico_etapa
                        const response = await knex.select('*').from('documentos_cliente_servico_etapa')
                        .where('id', id_doc);
                        arquivo = response[0]['documento'];
                    }
                }
                arquivo = new Uint8Array(arquivo).reduce(function (data, byte) {
                    return data + String.fromCharCode(byte);
                }, '');
                return res.json(arquivo);
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel gerar o documento."});
            };
        });
    },

    async deleteDocumentos(req, res){
        const token = req.headers['x-access-token'];
        const { id_doc, tipo } = req.body;

        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                if(tipo == 1){
                    console.log("Tabela tipo 1");
                    const response = await knex('documentos_cliente')
                    .where('id', id_doc).del();
    
                    // const response = await knex.select('*').from('documentos_cliente')
                    // .where('id', id_doc);

                }else if(tipo == 0){
                    console.log("Tabela tipo 0");
                    // documentos_cliente_servico_etapa

                    const response = await knex('documentos_cliente_servico_etapa')
                    .where('id', id_doc).del();

                    // const response = await knex.select('*').from('documentos_cliente_servico_etapa')
                    // .where('id', id_doc);
                    // arquivo = response[0]['documento'];
                }

                return res.json({data:response, status: 200,message:"Documento excluido com sucesso."});
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel excluir o documento."});
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

                // documentos_cliente_servico_etapa AS docsEtp
                const resVisita = await knex.select('visita.data','visita.horario', 'visita.endereco', 'visita.status', 'visita.id_cliente_servico_etapa')
                .from('visitas_cliente_servico_etapa AS visita')
                .innerJoin('cliente_servico_etapa AS cse', 'visita.id_cliente_servico_etapa', 'cse.id')
                .where('cse.id_cliente_servico',id_cliente_servico)
                .where('cse.etapa', 3);
                // resVisita[0].id_servico = resId_cliente_servico[0]['id_servico'];

                if(resVisita.length > 0){
                    resVisita[0]['data'] = moment(resVisita[0]['data']).format('DD/MM/YYYY');
                    // 10:00:00  -> 10h00
                    // let hora = moment(resVisita[0]['horario'], 'HHmmss').format('HH:mm');
                    // resVisita[0]['horario'] = hora.replace(':','h');
                    const res_doc = await knex.select('doc_admin').from('cliente_servico_etapa')
                    .where('id_cliente_servico', id_cliente_servico)
                    .where('etapa', 3);
                    if(res_doc[0]['doc_admin'] != null){
                        resVisita[0]['status'] = 1;
                    }
                }

                return res.json(resVisita);
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
                const response = await knex.select('id', 'cpf', 'avatar').from('user_cliente').where('cpf', cpf).where('status', 1);
                if(response.length > 0){
                    
                    let avatar = new Uint8Array(response[0].avatar).reduce(function (data, byte) {
                        return data + String.fromCharCode(byte);
                    }, '');
                    response[0]['avatar'] = avatar;
                    
                    return res.json({data:response, status: 200,message:"Carregando CPF"});
                }else{
                    return res.json({data:response, status: 540,message:"CPF do usuário em análise."});
                }
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os cpf"});
            }
        });
    },

    async getAvatar(req, res){
        const {id_cliente } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const response = await knex.select('avatar').from('user_cliente').where('id', id_cliente);
                let avatar = new Uint8Array(response[0].avatar).reduce(function (data, byte) {
                    return data + String.fromCharCode(byte);
                }, '');
                response[0]['avatar'] = avatar;
                return res.json({data:response, status:200, message:"Carregando foto."});
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregando foto."});
            }
        });
    },

    async addEndereco(req, res){
        const {id, id_cliente, titulo, endereco, numero, bairro, cidade, estado, cep } = req.body;
        
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                var response = null;
                var msg;
                console.log("ID add endereco: ", id);
                if(id === "" || id === null || id === undefined ){
                    console.log("else ADD endereco ");
                    // NOVO endereço
                    response = await knex('enderecos_cliente')
                    .insert({id_cliente, titulo, endereco, numero, bairro, cidade, estado, cep})
                    .returning('id');
                    msg = " cadastra";
                }else{

                    console.log("if Altera endereco ");
                    //ALTERAR endereco
                    response = await knex('enderecos_cliente').
                    update({titulo, endereco, numero, bairro, cidade, estado, cep})
                    .where('id', '=', id);
                    msg = " altera";

                   
                }
                console.log("Res end: ", response);
                // if(response.length > 0){
                    return res.json({data:response, status: 200,message:"Endereço"+msg+"do com sucesso"});
                // }else{
                //     return res.json({data:response, status: 540,message:"Não foi possivel"+msg+"r o endereço."});
                // }
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel cadatrar o endereço"});
            }
        });
    },

    async listaEndereco(req, res){
        const {id_cliente} = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const response = await knex.select('*').from('enderecos_cliente').where('id_cliente', id_cliente);
                if(response.length > 0){
                    return res.json({data:response, status: 200,message:"Carregando Endereço"});
                }else{
                    return res.json({data:response, status: 540,message:"Não possui endereço."});
                }
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os endereços"});
            }
        });
    },
    
    async deleteEndereco(req, res){
        const {id} = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const response = await knex('enderecos_cliente').delete().where('id', '=', id)
                return res.json({data:response, status: 200,message:"Deletado com sucesso!"});
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel deletar o endereço"});            
            }
        });
    },

    async cadServico(req, res){
        const { id_cliente, herdeiro_1, herdeiro_2, id_servico, estado, id_expansionista} = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            // VALIDAR resEtapas; validado, Está certo?

            try{
                const resEtapas = await knex('etapa_servico').select('etapa').where('id_servico', id_servico);
                console.log("etp: ", resEtapas);
                if(resEtapas.length > 0){
                    let data_cad = new Date();
                    const id_cliente_servico = await knex('cliente_servico').insert({id_cliente, herdeiro_1, herdeiro_2, id_servico, estado, id_expansionista, data_cad}).returning('id');
                    for(i = 1; i <= resEtapas.length; i++ ){
                        var status = 0;
                        if(i == 1){
                            status = 1
                        }else{
                            status = 0;
                        }
                        // var etapa = i;
                        var response = await knex('cliente_servico_etapa').insert({id_cliente_servico, etapa:i, status});
                    }
                    if(response.length > 0){
                        console.log("Certo ao cadastrar servico");
                        return res.json({message: 'Serviço cadastrado com sucesso!', status:200, id_cliente_servico:id_cliente_servico, data: response})
                    }else{
                        console.log("Error ao cadastrar 1");
                        return res.json({message: 'Erro ao cadastrar...',status:400, data: error});
                    }
                }else{
                    console.log("Error ao cadastrar 2");
                    return res.json({message: 'Erro ao cadastrar servico, etapas não estabelecidas...',status:400, data: error});
                }
            }catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel cadastrar servico"});            
            }
            
        });
    },
    
    async listaPlntaJBS(req, res){
        const {estado} = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try{
                const resPlanta = await knex.select('*').from('planta').where({estado});
                
                console.log("Lista Planta: ", resPlanta);

                if(resPlanta.length > 0){

                    return res.json({message: 'Planta retornado com sucesso!', status:200, data: resPlanta});

                }else{
                    console.log("Error ao gerar planta.");
                    return res.json({message: 'Não possiu planta nesse estado...', status:300, data: []});
                }
            }catch (error) {
                console.log("Error.");

                return res.json({data:error, status: 400,message:"Não foi possivel gerar lista de Planta"});
            }
        });
    },

    async getExpansionista(req, res){
        const {id_planta} = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try{
                const resExpansionista = await knex.select('*').from('expansionista').where({id_planta});

                // const resExpansionista = await knex('*').select('expansionista').where('id_planta', id_planta);

                if(resExpansionista.length > 0){

                    return res.json({message: 'Expansionistas retornado com sucesso!', status:200, data: resExpansionista});

                }else{
                    console.log("Error ao gerar expansionista.");
                    return res.json({message: 'Erro ao gerar expansionista...', status:300, data: []});
                }
            }catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel gerar expansionista"});
            }
            
        });
    },

    async listEtapa(req, res){
        const { id_cliente_servico } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

            const response = await knex('cliente_servico AS cs')
            .select('cs.id as id_cliente_servico','cs.id_servico', 'cse.etapa', 'cse.status as status_etapa','cse.adicional', 'cse.status_processo_interno', 'e.id as id_etapa', 'e.nome as nome_etapa')
            .innerJoin('cliente_servico_etapa as cse', 'cs.id', 'cse.id_cliente_servico')
            .innerJoin('servicos AS s', 'cs.id_servico', 's.id')
            .innerJoin('etapa_servico AS es', function() {
                this.on('cs.id_servico', '=', 'es.id_servico').andOn('cse.etapa', '=', 'es.etapa')
              })
            .innerJoin('etapas as e', 'es.id_etapa', 'e.id')
            .where('cs.id', id_cliente_servico);

            if(response.length > 0){
                console.log("Carregando etapas.");
                return res.json({message: 'Carregando etapas.', status:200, data: response});
            }else{
                console.log("Error ao cadastrar");
                return res.send({message: 'Erro ao carregar etapas...',status:400, data: error});
            }          
        });
    },

    async seusPlanos(req, res) {
        const { id_cliente } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function (err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                var response = await knex.select('cs.id as id_cliente_servico', 'cs.id_servico AS id_servico', 'cs.herdeiro_1',
                    'cs.herdeiro_2', 's.nome AS nome_servico', 's.icone', 's.descricao AS descricao_servico', 'cs.data_cad', 'cse.status')
                    .from('cliente_servico AS cs')
                    .innerJoin('cliente_servico_etapa as cse', 'cs.id', 'cse.id_cliente_servico')
                    .innerJoin('servicos AS s', 'cs.id_servico', 's.id')
                    //'cse.etapa'
                    // .where(function () {
                    //     this.where('cse.status', 1).orWhere('cse.status', 0)
                    // })
                    .where(function () {
                        this.where('cs.id_cliente', id_cliente).orWhere('cs.herdeiro_1', id_cliente).orWhere('cs.herdeiro_2', id_cliente)
                    })
                    // .where('cs.id_cliente', id_cliente, OR, 'cs.herdeiro_1', id_cliente, OR, 'cs.herdeiro_2', id_cliente)
                    //.orderBy('cse.etapa', 'desc')
                    .groupBy('cse.id_cliente_servico');
                // console.log(response);

                if (response.length > 0) {
                    //await response.forEach(async (item, aux) => {
                    for (let i = 0; i < response.length; i++) {
                        var id_cliente_servico = response[i].id_cliente_servico;
                        var responseStatus = await knex.select('status')
                            .from('cliente_servico_etapa').where('id_cliente_servico', id_cliente_servico).where('status', 1);
                            
                        if (responseStatus.length > 0) {
                            response[i]['etapa'] = "Em andamento";
                            response[i]['status'] = 1;
                        } else {
                            response[i]['etapa'] = "Finalizado";
                            response[i]['status'] = 2;
                        }

                        let dt = new Date(response[i].data_cad);
                        response[i].data_cad = dt.toLocaleDateString('pt-br');

                        const base64 = String.fromCharCode.apply(null, new Uint16Array(response[i].icone));
                        response[i]['icone'] = base64;
                    }
                    return res.json({ data: response, status: 200, message: "Carregando os planos" });
                } else {
                    return res.json({ data: response, status: 540, message: "Sem planos em andamento" });
                }
            } catch (error) {
                return res.json({ data: error, status: 400, message: "Não foi possivel carregar os planos em andamento" });
            }
        });
    },

    async cadDocCliente(req, res){
        const { id_cliente, tipo_doc, documento, tipo, id_cliente_servico, etapa } = req.body;

        console.log(req.body);

        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            let data_cad = new Date();
            if(tipo == 1){
                const response = await knex('documentos_cliente').insert({id_cliente, tipo_doc, documento, data_cad});
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
                const response = await knex('documentos_cliente_servico_etapa').insert({id_cliente, tipo_doc, documento, id_cliente_servico_etapa:id_cliente_servico_etapa[0]['id'], data_cad});
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

    async meusDocumentos(req, res){
        const token = req.headers['x-access-token'];
        const {id_cliente} = req.body;
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                var res_doc_cliente = await knex.select('dc.id','dc.tipo_doc', 'dc.data_cad','td.nome','td.tipo', 'td.setor')
                .from('documentos_cliente AS dc')
                .innerJoin('tipo_documento AS td','td.id','dc.tipo_doc')
                .where('id_cliente', id_cliente);

                await res_doc_cliente.forEach((item) => {
                    if(item.data_cad){
                        let dt = new Date(item.data_cad);
                        item.data_cad = dt.toLocaleDateString('pt-br');
                    }
                });

                var res_doc_cli_servico = await knex.select('dcse.id','dcse.tipo_doc','dcse.data_cad','td.nome','td.tipo', 'td.setor')
                .from('documentos_cliente_servico_etapa AS dcse')
                .innerJoin('tipo_documento AS td','td.id','dcse.tipo_doc')
                .where('id_cliente', id_cliente);
                // await res_doc_cliente.forEach((item) => {
                    
                // });

                await res_doc_cli_servico.forEach((item)=>{
                    if(item.data_cad){
                        let dt = new Date(item.data_cad);
                        item.data_cad = dt.toLocaleDateString('pt-br');    
                    }
                    res_doc_cliente.push(item);
                });

                res_doc_cliente.forEach(element => {
                    element.nome= element.nome.toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
                        return a.toUpperCase();
                      });
                      
                    element.nome = element.nome.normalize("NFD").replace(/[^a-zA-Zs]/g, "");
                    element.nome = element.nome + ".pdf"
                });
                
                return res.json(res_doc_cliente);
            } catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os documentos peossoais"});
            };
        });
    },

    async updateTell(req, res){
        const token = req.headers['x-access-token'];
        const { id_cliente, contato, numero } = req.body;
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                if(contato == "tel"){
                    const response = await knex('user_cliente')
                    .update('telefone', numero).where('id', '=', id_cliente);
                    return res.json("Telefone alterado com sucesso!")
                }else if(contato == "cel"){
                    const response = await knex('user_cliente')
                    .update('celular', numero).where('id', '=', id_cliente);
                    return res.json("Celular alterado com sucesso!")

                }
                
            } catch (error) {
                return res.send("Não foi possivel alterar o contato.");
            }
        });
    },
    
    async updateAvatar(req, res){
        const token = req.headers['x-access-token'];
        const { id_cliente, avatar } = req.body;
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const response = await knex('user_cliente')
                .update('avatar', avatar).where('id', '=', id_cliente);
                return res.json("Avatar alterado com sucesso!");
            } catch (error) {
                return res.send("Não foi possivel alterar o avatar.");
            }
        });
    },

    async updateSenha(req, res){
        const token = req.headers['x-access-token'];
        const { id_cliente, nova_senha, atual_senha  } = req.body;
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                const response_senha = await knex('user_cliente')
                .select('senha').where('id', '=', id_cliente);
                
                if(response_senha[0].senha == atual_senha){
                    const response = await knex('user_cliente')
                    .update('senha', nova_senha).where('id', '=', id_cliente);

                    return res.json({status:200, message:"Senha alterada com sucesso!"});
                }else{
                    return res.json({status:500, message:"Senha incorreta!"});
                }
            } catch (error) {
                return res.send({status:400, message:"Não foi possivel alterar a senha."});
            }
        });
    },

    async orcamentosJBS(req, res){
        const {id_cliente_servico, etapa, id_etapa} = req.body;

        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                var JBS = {
                    "orc_obras":"",
                    "saida_obras":"",
                    "saldo_obras":"",

                    "orc_equipamentos":"",
                    "saida_equipamentos":"",
                    "saldo_equipamentos":"",
                    "extrato":{}
                };
                const res_id_cliente_servico_etapa = await knex.select('id').from('cliente_servico_etapa')
                .where('id_cliente_servico', id_cliente_servico)
                .where('etapa', etapa);

                const res_adicional_cliente_servico_etapa = await knex.select('adicional','orc_recursos', 'orc_equipamentos').from('cliente_servico_etapa')
                .where('id_cliente_servico', id_cliente_servico)
                .where('etapa', 5);

                const response = await knex.select('id', 'id_cliente_servico_etapa', 'titulo', 'valor','tipo', 'cod_banco', 'agencia', 'conta', 'titular', 'cnpj', 'motivo', 'data_cad')
                .from('orcamento_cliente_servico_etapa')
                .where('id_cliente_servico_etapa', res_id_cliente_servico_etapa[0]['id']);
                

                var saldo_obras = res_adicional_cliente_servico_etapa[0]['adicional'];
                saldo_obras = saldo_obras.replace('.','');
                saldo_obras = saldo_obras.replace(',','.');
                saldo_obras = Number.parseFloat(saldo_obras);
                var saida_obras = 0;

                var saldo_equipamentos = res_adicional_cliente_servico_etapa[0]['orc_equipamentos'];
                saldo_equipamentos = saldo_equipamentos.replace('.','');
                saldo_equipamentos = saldo_equipamentos.replace(',','.');
                saldo_equipamentos = Number.parseFloat(saldo_equipamentos);
                var saida_equipamentos = 0;

                if(response.length > 0){
                    // console.log("response orcamento_cliente_servico_etapa: \n", response);
                    await response.forEach(item => {
                        
                        if(item.tipo == 'Obras'){
                            // var obras = (item.valor).toLocaleString('pt-br', {minimumFractionDigits: 2});
                            var obras = (item.valor).replace('.','');
                            obras = obras.replace(',','.');
                            obras = Number.parseFloat(obras);
                            saldo_obras = saldo_obras - obras;
                            saida_obras = saida_obras + obras;

                            item.valor = obras.toLocaleString('pt-br', {minimumFractionDigits: 2});

                        }else if(item.tipo == 'Equipamentos'){
                            // var equipamentos = (item.valor).toLocaleString('pt-br', {minimumFractionDigits: 2});
                            var equipamentos = (item.valor).replace('.','');
                            equipamentos = equipamentos.replace(',','.');
                            equipamentos = Number.parseFloat(equipamentos);
                            saldo_equipamentos = saldo_equipamentos - equipamentos;
                            saida_equipamentos = saida_equipamentos + equipamentos;

                            item.valor = equipamentos.toLocaleString('pt-br', {minimumFractionDigits: 2});
                        };
                        
                        let dt = new Date(item.data_cad);
                        item.data_cad = dt.toLocaleDateString('pt-br');
                    });
                }

                JBS.orc_obras = (res_adicional_cliente_servico_etapa[0]['adicional']).toLocaleString('pt-br', {minimumFractionDigits: 2});
                JBS.saida_obras = saida_obras.toLocaleString('pt-br', {minimumFractionDigits: 2});
                JBS.saldo_obras = saldo_obras.toLocaleString('pt-br', {minimumFractionDigits: 2});

                JBS.orc_equipamentos = (res_adicional_cliente_servico_etapa[0]['orc_equipamentos']).toLocaleString('pt-br', {minimumFractionDigits: 2});
                JBS.saida_equipamentos = saida_equipamentos.toLocaleString('pt-br', {minimumFractionDigits: 2});
                JBS.saldo_equipamentos = saldo_equipamentos.toLocaleString('pt-br', {minimumFractionDigits: 2});

                JBS.extrato = response;
                
                if(response.length > 0){
                    return res.json({data:JBS, status: 200,message:"Carregando Orçamentos"});
                }else{
                    return res.json({data:JBS, status: 540,message:"Não possui Orçamentos."});
                }
            } catch(error){
                console.log("erro JBS: ",error);
                return res.json({data:error, status: 400,message:"Não foi possivel carregar os Orçamentos"});
            }
        });
    },

    async recuperacao_senha(req, res){
        const { email } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

            try{
                const res_user_cliente_email = await knex('user_cliente').select('email').where('email', email);
                if(res_user_cliente_email.length > 0){

                    const id = 1; //esse id viria do banco de dados
                    const token_senha = jwt.sign({ id }, process.env.SECRET, {
                        expiresIn: 300 // expires in 5min
                    });

                    let data_cad = new Date();
                    const response = await knex('recuperacao_senha').insert({ email, data_cad,'token': token_senha}).returning('id');

                    
                    if(response.length > 0){
                        console.log("Sucesso recuperação de senha.");
                        
                        var transporter = nodemailer.createTransport({
                            host: 'smtp.hostinger.com.br',
                            port: 587,
                            secure: false,
                            requireTLS: true,
                            auth: {
                              user: 'site@evolutionsoft.com.br',
                              pass: 'Evolution@2021'
                            }
                          });
                          
                        
                        let url = 'http://agroempreender.com.br/painel-administrativo/recuperarSenha.html?token='+token_senha+'&email='+email;
                        var mailOptions = {
                            from: 'site@evolutionsoft.com.br',
                            to: email,
                            subject: 'Redefinir Senha - agroempreender',
                            html: 'Olá prezado.</br>Ouvimos dizer que você esqueceu sua senha. </br>Abaixo segue o link para redefinicao de senha.</br></br><a href="'+url+'">alterar senha</a>'
                          };
                          
                          transporter.sendMail(mailOptions, async function(error, info){
                            if (error) {
                                return res.json({response: error})
                            } else {
                                return res.json({message: 'Solicitação de senha solicitada com sucesso!', status:200, data: response})
                               // return res.json({response: 'Enviamos o link de redefinicao de senha em seu email, por favor verifique sua caixa de entrada!!!'});
                            }
                          });

                    }else{
                        console.log("Error ao cadastrar");
                        return res.json({message: 'Não foi possivel recuperar senha.', status:402});
                    }
                }else{
                    console.log("Error ao cadastrar");
                    //nao mudar o status
                    return res.json({message: 'Não foi possivel recuperar senha. Email não cadastrado.', status:401});
                }
            }catch (error) {
                return res.json({data:error, status: 400,message:"Não foi possivel recuperar senha."});            
            }
        });
    },

    async valida_token_recuperacao(req, res){
        const { token, email } = req.body;

        try {
            const response = await knex.select('id').from('recuperacao_senha').where('token',token).where({email});
            console.log(response);
            if(response.length > 0){

                jwt.verify(token, process.env.SECRET, async function(err, decoded) {
                    if (err) return res.send(`<h3>Sua sessão expirou!!!</h3> <br> Solicite uma nova redefinição de senha.`);
                    

                    return res.send(`
                    <form class="user" id="form-login" action="" style="margin-top: 20px;">
                        <div class="form-group">
                        <input type="password" class="form-control form-control-user" id="senha1" name="senha1" placeholder="nova senha">
                        </div>
                        <div class="form-group" style="display:flex">
                        <input type="password" class="form-control form-control-user" id="senha2" placeholder="confirmacao de senha" name="senha2">
                    
                        </div>
                        <button onclick="recuperar_senha()" id="loginButton" class="btn btn-user btn-block">
                        Login
                        </button>
                    </form>
                    `)
                });

                
            }else{
                return res.send('Recuperação de senha invalida!!! <br> Solicite a recuperação de senha pelo APP.');
            }
        } catch (error) {
            return res.json(error);
        }
    },

    async altera_recuperacao_senha(req, res){
        const token = req.headers['x-access-token'];
        const { email, senha } = req.body;
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
            if (err) return res.send(`<h3>Sua sessão expirou!!!</h3> <br> Solicite uma nova redefinição de senha.`);
            

            try {
                const response = await knex('user_cliente')
                .update('senha', senha).where('email', '=', email);
                
                if(response){
                    return res.send(`<h3>Senha alterada com sucesso!</h3>`);
                }else{
                    return res.send(`<h3>Erro ao alterar senha!</h3>`);
                }
            } catch (error) {
                return res.send(`<h3>Não foi possivel alterar a senha.</h3>`);
            }
        });
    },

    async id_user_notification(req, res){
        const token = req.headers['x-access-token'];
        const { id_cliente, user_id } = req.body;
        if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
            try {
                if(user_id !== null ){
                    const response = await knex('user_cliente')
                    .update('id_user_notification', user_id).where('id', '=', id_cliente);
                    return res.json("Id notificação alterado com sucesso!")
                }
            } catch (error) {
                return res.send("Não foi possivel alterar o Id de notificação.");
            }
        });
    },


    //Funcoes teste
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