import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../_gurads/auth.guard';
import { ExportIncidentComponent } from './export/export-incident.component';
import { ExportListComponent } from './export/list/export-list.component';
import { ManageIncidentComponent } from './manage/manage-incident.component';
import { IncidentSearchComponent } from './search/search.component';

const routes: Routes = [    
    { path: '', redirectTo: 'search' },
    { path: 'search', component: IncidentSearchComponent, canActivate: [AuthGuard] },
    { path: 'exports', component: ExportListComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)]
})
export class IncidentRoutingModule {
}
