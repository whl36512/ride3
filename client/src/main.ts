import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { AppInjector } from './app/models/app-injector.service';

//import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

//platformBrowserDynamic().bootstrapModule(AppModule)
  //.catch(err => console.log(err));

platformBrowserDynamic().bootstrapModule(AppModule).then((moduleRef) => {
        AppInjector.setInjector(moduleRef.injector);
    });        
