import { env } from '~config/env.config';

env.ROOT_PATH = __dirname; // Should be on top

import { Bootstrap } from '~core/bootstraps/bootstrap';

async function startApp() {
    let bootstrap = new Bootstrap();
    await bootstrap.initApp();
    bootstrap.initPipes();
    bootstrap.initCors();
    bootstrap.buildSwagger();
    bootstrap.initStaticAsset();
    await bootstrap.start();
    await bootstrap.enableHotReload();
}

startApp()
    .then(() => console.log('Init app success'))
    .catch(console.error);
