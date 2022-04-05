import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../_gurads/auth.guard';
// import { ManageIncidentComponent } from './manage/manage-incident';
import { IncidentSearchComponent } from './search/search.component';

const routes: Routes = [    
    { path: '', redirectTo: 'search' },
    { path: 'search', component: IncidentSearchComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)]
})
export class IncidentRoutingModule {
}
