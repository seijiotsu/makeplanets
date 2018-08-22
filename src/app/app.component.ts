import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ClarityIcons } from '@clr/icons';
import '@clr/icons/shapes/all-shapes';

import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  @Input() user: User;
  constructor(public auth: AuthService, private userAPI: UserService) {
    ClarityIcons.add({ "makeplanets": '<img src="assets/newlogo.svg" />' });
    ClarityIcons.add({ "addcelestial": '<img src="assets/addcelestial.svg" />' });
  }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    this.userAPI.getMyself()
      .subscribe(res => {
        this.user = res;
      }, err => {
        console.log(err);
      });
  }
}
