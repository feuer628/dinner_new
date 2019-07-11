require('dotenv').config();

import express from 'express';
import bodyParser from 'body-parser';
import sassMiddleware from 'node-sass-middleware';
import {init} from "./db";
import {role} from "./routes/role";
import {action} from "./routes/action";

export const LOG = require('simple-node-logger').createSimpleLogger('project.log');

(async () => {
    const httpPort = process.env.HTTP_PORT;

    const app = express();

    init();

    app.set('port', httpPort);

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
    // parse application/json
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use("/roles", role);
    app.use("/actions", action);
    app.use(sassMiddleware({
            src: __dirname,
            dest: __dirname,
            debug: true
        })
    );

    app.use("/public", express.static(__dirname + '/public_html'));
    app.get('/', function(req, res) {
        res.sendFile(__dirname + "/public/index.html");
    });

    app.listen(httpPort, function () {
        LOG.info(`Example app listening on port ${httpPort}!`);
    });
})();