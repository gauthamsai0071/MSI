import { NgModule } from '@angular/core';
import { ModalModule, ToastService } from '@msi/cobalt';
import { IncidentSearchComponent } from './search/search.component';
import { IncidentFilterComponent } from './search/filter/filter.component';
import { SharedModule } from '../../shared.module';
import { IncidentSearchService } from '../../services/incident/search.service';
import { IncidentRoutingModule } from './incident-routing.module';
import { IncidentSearchResultComponent } from './search/result/result.component';
import { ManageIncidentComponent } from './manage/manage-incident.component';
import { IncidentService } from '../../services/incident/incident.service';
import { IncidentSavedFiltersComponent } from './search/filter/saved-filters/saved-filters.component';
import { ExportIncidentComponent } from './export/export-incident.component';
import { ExportListComponent } from './export/list/export-list.component';
import { SaveFilterComponent } from './search/filter/save-filter/save-filter.component';

@NgModule({
  declarations: [
    ManageIncidentComponent,
    ExportIncidentComponent,
    ExportListComponent,
    IncidentSearchComponent,
    IncidentFilterComponent,
    IncidentSearchResultComponent,
    IncidentSavedFiltersComponent,
    SaveFilterComponent
  ],
  imports: [
    ModalModule,
    SharedModule,
    IncidentRoutingModule
  ],
  entryComponents: [
    ManageIncidentComponent
  ],
  providers: [
    ToastService,
    IncidentService,
    IncidentSearchService
  ]
})
export class IncidentModule { }
