import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth.service';
import { SystemService } from '../system.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public auth: AuthService, public system: SystemService, public app: AppComponent) { }

  ngOnInit() {
    this.app.getUser();
  }

}
