import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SharedModule } from './shared.module';
import { MediaSearchComponent } from './components/media/search/search.component';
import {  MediaFilterComponent } from './components/media/search/filter/filter.component'
import { MediaFilterService } from './services/media/media-filter.service';
import { MediaSearchResultComponent } from './components/media/search/result/media-search-result.component';
import { SidebarComponent } from './components/common/sidebar/sidebar.component';
import { shareIncidentComponent } from './components/incident/share/share-incident.component';
import { Incident } from './models/incident/incident';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    MediaSearchComponent,
    MediaFilterComponent,    
    MediaSearchResultComponent, SidebarComponent,
    shareIncidentComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    
  ],  
  providers: [ 
    MediaFilterService,
    Incident
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
