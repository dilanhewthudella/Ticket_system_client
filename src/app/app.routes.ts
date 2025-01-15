import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'config' },
    {
      path: 'config',
      //canActivate: [AuthGuard],
      loadChildren: () => import('./module/configurations/configurations.module').then((m) => m.ConfigurationsModule),
    },
];
