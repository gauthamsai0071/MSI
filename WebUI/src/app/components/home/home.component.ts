import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomField } from 'src/app/models/common/custom-field';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  mediaSearchCriteria : {
    filterCriteria : FormGroup,
    calendarFields : Map<number, string>,
    checkBoxFields : Map<string, Array<string>>,
    searchFields : CustomField[]
  };

  constructor(private authService: AuthService, private router: Router) {
  }

  
  logout(){
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
  searchCriteria(mediaSearchCriteria : {
    filterCriteria : FormGroup,
    calendarFields : Map<number, string>,
    checkBoxFields : Map<string, Array<string>>,
    searchFields : CustomField[],
  }){
    this.mediaSearchCriteria = mediaSearchCriteria;
  }
}
