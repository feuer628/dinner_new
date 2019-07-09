/* eslint-disable no-console */
import {Request, Response} from 'express';

require('dotenv').config();

import express from 'express';
import bodyParser from 'body-parser';
import sassMiddleware from 'node-sass-middleware';

(async () => {
    const httpPort = process.env.HTTP_PORT;

    const log = require('simple-node-logger').createSimpleLogger('project.log');

    const app = express();

    app.set('port', httpPort);

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
    // parse application/json
    app.use(bodyParser.json({ limit: '10mb' }));
    app.get("/users", dinnerSetRatingHandler);
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
        log.info(`Example app listening on port ${httpPort}!`);
    });
})();

export async function dinnerSetRatingHandler(req: Request, res: Response): Promise<void> {
    res.json([{user1: "dfsdfs", user2: "sdfwegwgsdge"}]);
}