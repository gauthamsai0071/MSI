import { NgModule } from '@angular/core';
import { ToastService } from '@msi/cobalt';
import { IncidentSearchComponent } from './search/search.component';
import { IncidentFilterComponent } from './search/filter.component';
import { SharedModule } from '../../shared.module';
import { IncidentSearchService } from '../../services/incident/search.service';
import { IncidentRoutingModule } from './incident-routing.module';


@NgModule({
  declarations: [
    IncidentSearchComponent,
    IncidentFilterComponent
  ],
  imports: [
    SharedModule,
    IncidentRoutingModule
  ],  
  providers: [ 
    ToastService,
    IncidentSearchService
  ]
})
export class IncidentModule { }
