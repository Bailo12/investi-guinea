import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { encryptionInterceptor } from './app/core/interceptors/encryption.interceptor';
import { fraudDetectionInterceptor } from './app/core/interceptors/fraud-detection.interceptor';
import { auditInterceptor } from './app/core/interceptors/audit.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      authInterceptor,
      auditInterceptor,
      fraudDetectionInterceptor,
      encryptionInterceptor
    ])),
    provideAnimations()
  ]
}).catch(err => console.error(err));

