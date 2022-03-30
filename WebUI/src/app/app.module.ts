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
import { MediaSearchComponent } from './components/media/search/search.component';
import { MediaFilterComponent } from './components/media/search/filter/filter.component';
import { MediaCustomFiltersService } from './services/media/custom-filters.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
    MediaSearchComponent,
    MediaFilterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule    
  ],  
  providers: [ 
    ToastService,
    MediaCustomFiltersService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
