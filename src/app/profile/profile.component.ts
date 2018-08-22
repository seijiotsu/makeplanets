import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../user.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private userAPI: UserService) { }

  @Input() user: User = null;

  ngOnInit() {
    this.init();
    this.get();
  }

  init() {
    this.userAPI.initializeUser()
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

  get() {
    this.userAPI.getMyself()
      .subscribe(res => {
        this.user = res;
      }, err => {
        console.log(err);
      });
  }
  put() {
    this.userAPI.putUser(this.user)
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

}
