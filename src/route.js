const express = require('express');
const AuthController = require('./controller/AuthController');
const UserController = require('./controller/UserController');
const route = express.Router();

route.post('/token', AuthController.token);
route.post('/login', AuthController.login);
route.post('/cadastro', UserController.create);
route.post('/getConsorcios', UserController.getConsorcios);
route.post('/isCpf', UserController.isCpf);
route.post('/listaDocs', UserController.listaDocsCli);
route.post('/cadServico', UserController.cadServico);
route.post('/listEtapa', UserController.listEtapa);
route.post('/cadDocCliente', UserController.cadDocCliente);
route.post('/listDocPropriedade', UserController.listDocPropriedade);
route.post('/docsEtapas', UserController.docsEtapas);
route.post('/docVisita', UserController.docVisita);
route.post('/docLaudo', UserController.docLaudo);
route.post('/seusPlanos', UserController.seusPlanos);


route.get('/usuario', UserController.index);
route.put('/usuario', UserController.update);
route.delete('/usuario', UserController.delete);

module.exports = route;