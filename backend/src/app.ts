import express from 'express';
import bodyParser from 'body-parser';
import sassMiddleware from 'node-sass-middleware';
import {init} from "./db";
import {role} from "./routes/role";
import {action} from "./routes/action";
import dotenv from 'dotenv';
import {organization} from "./routes/organization";
import {org_group} from "./routes/org_group";

export const LOG = require('simple-node-logger').createSimpleLogger('project.log');

(async () => {

    dotenv.config();
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
    app.use("/organizations", organization);
    app.use("/org_groups", org_group);

    app.use(sassMiddleware({
            src: __dirname,
            dest: __dirname,
            debug: true
        })
    );

    app.use("/public", express.static(__dirname + '/public'));
    app.get('/', function(req, res) {
        res.sendFile(__dirname + "/public/index.html");
    });

    app.listen(httpPort, function () {
        LOG.info(`Example app listening on port ${httpPort}!`);
    });
})();