const express = require('express');
const AuthController = require('./controller/AuthController');
const UserController = require('./controller/UserController');
const route = express.Router();

route.post('/token', AuthController.token);
route.post('/login', AuthController.login);
route.post('/cadastro', UserController.create);
route.post('/getConsorcios', UserController.getConsorcios);
route.post('/getImagemConsorcio', UserController.getImagemConsorcio);
route.post('/getServicos', UserController.getServicos);
route.post('/getSlider', UserController.getSlider);
route.post('/isCpf', UserController.isCpf);
route.post('/listaDocs', UserController.listaDocsCli);
route.post('/cadServico', UserController.cadServico);
route.post('/listEtapa', UserController.listEtapa);
route.post('/cadDocCliente', UserController.cadDocCliente);
route.post('/listDocPropriedade', UserController.listDocPropriedade);
route.post('/dadosProcessoEtapa', UserController.dadosProcessoEtapa);
route.post('/docVisita', UserController.docVisita);
route.post('/docLaudo', UserController.docLaudo);
route.post('/seusPlanos', UserController.seusPlanos);
route.post('/listaEndereco', UserController.listaEndereco);
route.post('/addEndereco', UserController.addEndereco);
route.post('/deleteEndereco', UserController.deleteEndereco);
route.post('/meusDocumentos', UserController.meusDocumentos);
route.post('/updateTell', UserController.updateTell);
route.post('/updateSenha', UserController.updateSenha);
route.post('/getAvatar', UserController.getAvatar);
route.post('/downloadArquivos', UserController.downloadArquivos);
route.post('/updateAvatar', UserController.updateAvatar);
route.post('/orcamentosJBS', UserController.orcamentosJBS);
route.post('/recuperacaoSenha', UserController.recuperacao_senha);
route.post('/valida_token_recuperacao',UserController.valida_token_recuperacao);
route.post('/listaPlntaJBS', UserController.listaPlntaJBS);
route.post('/getExpansionista', UserController.getExpansionista);
route.post('/setUserIdNotification', UserController.id_user_notification);




route.get('/usuario', UserController.index);
route.put('/usuario', UserController.update);
route.delete('/usuario', UserController.delete);

module.exports = route;