/**
 * @name ws-server Instanciation d'un serveur websocket sur un serveur HTTP
 */

// Importation des packages nécessaires
import express from 'express'; // Framework NodeJS
import * as http from 'http'; // Module serveur HTTP
import * as WebSocket from 'ws'; // Module serveur WebSocket

// Initialisation d'une nouvelle application Express
const app = express();

// Initialise un serveur HTTP (support de communication avec le client)
const server = http.createServer(app);

// Initialise une instance de Websocket
const wss = new WebSocket.Server({ server });

// Tableau de stockage des utilisateurs
let _users: Map<WebSocket,any> = new Map<WebSocket,any>();

// Le serveur WebSocket écoute certains événements...
wss.on('connection', (ws: WebSocket, request: Request) => {

    // Données transmettre aux clients
    let envelop: any = {};

    // La connexion est okay, on envoie un simple message
    ws.on('message', (message: string) => {

        // Affiche le message dans la console et retourne au client
        console.log('Reçu: %s [%d]', message, new Date());

        let _clientObject = JSON.parse(message);

        if (typeof _clientObject === 'string') {
            _clientObject = JSON.parse(_clientObject);
        }
        console.log('Objet : ' + _clientObject + ' Type : ' + typeof _clientObject);

        console.log('From : ' + _clientObject.user);
        if (_clientObject.hasOwnProperty('connect')) {
            // Il s'agit d'une connexion utilisateur
            _users.set(ws, _clientObject);
            envelop.user = _clientObject.user;
            envelop.message = 'Bonjour : ' + _clientObject.user;
            // Echo pour l'émétteur
            console.log('Echo local : ' + JSON.stringify(envelop));
            ws.send(JSON.stringify(envelop));
        } else {
            if (_clientObject.hasOwnProperty('userList')) {
                // Retourne la liste des utilisateurs connectés
                const _userList: any[] = [];
                wss.clients
                .forEach(client => {
                    if (client != ws) {
                        _userList.push(_users.get(ws));
                    }
                });
                ws.send(JSON.stringify(_userList));
            } else {
                // Broadcast vers les autres clients
                wss.clients
                .forEach(client => {
                    if (client != ws) {
                        envelop.user = _clientObject.user;
                        envelop.message = _clientObject.message;
                        console.log('Broadcast : ' + JSON.stringify(envelop));
                        client.send(JSON.stringify(envelop));
                    }
                });
            }
        }
    });

    /**
    // Envoie immédiatement une information au client connecté
    const _user: any = request.body;
    console.log('Nouveau client : ' + _user);
    _users.set(ws, _user);   
    envelop.message = 'Bonjour ' + _user.user + '... Bienvenue sur le tchat';
    ws.send(JSON.stringify(envelop));
    */
});

// Démarre le serveur 
server.listen(process.env.PORT || 8999, () => {
    console.log(`Le serveur est démarré sur l'adresse : 8999} :)`);
    //console.log ('Le serveur est démarré et écoute sur l\'adresse ' + server.address());
});