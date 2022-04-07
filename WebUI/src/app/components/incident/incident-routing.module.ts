import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../_gurads/auth.guard';
import { ManageIncidentComponent } from './manage/manage-incident.component';
import { IncidentSearchComponent } from './search/search.component';

const routes: Routes = [    
    { path: '', redirectTo: 'search' },
    { path: 'search', component: IncidentSearchComponent, canActivate: [AuthGuard] },
    { path: 'create', component: ManageIncidentComponent, canActivate: [AuthGuard] },
    { path: 'view/:id', component: ManageIncidentComponent, canActivate: [AuthGuard] },
    { path: 'edit/:id', component: ManageIncidentComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)]
})
export class IncidentRoutingModule {
}
