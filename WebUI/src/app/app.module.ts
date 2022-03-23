import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastService } from '@msi/cobalt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SharedModule } from './shared.module';
import { HeaderComponent } from './components/common/header/header.component';
import { SearchComponent } from './components/media/search/search.component';
import { FilterComponent } from './components/media/search/filter/filter.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CustomFiltersService } from './services/customFilters/custom-filters.service';
import { IncidentsComponent } from './components/incidents/incidents.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    IncidentsComponent,
    HeaderComponent,
    SearchComponent,
    FilterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,    
    NgMultiSelectDropDownModule.forRoot()
  ],  
  providers: [ 
    ToastService,
    CustomFiltersService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
