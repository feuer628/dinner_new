import express from 'express';
import bodyParser from 'body-parser';
import sassMiddleware from 'node-sass-middleware';
import {init} from "./db";
import {role} from "./routes/role";
import {action} from "./routes/action";
import dotenv from 'dotenv';
import {organization} from "./routes/organization";
import {org_group} from "./routes/org_group";
import {provider} from "./routes/provider";
import {menu_item} from "./routes/menu_item";
import {user} from "./routes/user";
import {verifyToken} from "./routes/middlewares";
import {registration} from "./routes/registration";
import {sign_in} from "./routes/sign_in";
import {order} from "./routes/order";
import {menu} from "./routes/menu";

const fileUpload = require('express-fileupload');

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

    app.use(fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    }));

    app.use("/roles", verifyToken, role);
    app.use("/actions", verifyToken, action);
    app.use("/organizations", organization);
    app.use("/org_groups", verifyToken, org_group);
    app.use("/providers", verifyToken, provider);
    app.use("/menu_items", verifyToken, menu_item);
    app.use("/users", verifyToken, user);
    app.use("/sign_up", registration);
    app.use("/sign_in", sign_in);
    app.use("/orders", verifyToken, order);
    app.use("/menu", verifyToken, menu);

    app.use(sassMiddleware({
            src: __dirname,
            dest: __dirname,
            debug: true
        })
    );

    app.use("/public", express.static(__dirname + '/public'));
    app.use('/favicon.ico', express.static(__dirname + '/public/favicon.ico'));
    app.get('/', function(req, res) {
        res.sendFile(__dirname + "/public/index.html");
    });

    app.listen(httpPort, function () {
        LOG.info(`Example app listening on port ${httpPort}!`);
    });
})();