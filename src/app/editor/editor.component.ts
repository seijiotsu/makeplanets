import { Component, OnInit, Input } from '@angular/core';
import { SystemService } from '../system.service';

import { System } from 'src/app/models/system.model';
import { Celestial } from 'src/app/models/celestial.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  @Input() systems: System[];


  constructor(public systemAPI: SystemService, public auth: AuthService) { }

  ngOnInit() {
    this.getSystems();
  }

  getSystems() {
    this.systemAPI.getUserSystems()
      .subscribe(res => {
        this.systems = res;
      }, err => {
        console.log(err);
      });
  }

  newSystem(): void {
    this.systemAPI.newSystem()
      .subscribe(res => {
        this.systems.push(res);
      }, err => {
        console.log(err);
      });
  }

  deleteSystem(_id: string): void {
    for (var i = 0; i < this.systems.length; i++) {
      if (this.systems[i]._id == _id) {
        this.systems.splice(i, 1);
      }
    }
    this.systemAPI.deleteSystem(_id)
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });

  }

  cPOST() {
    this.systemAPI.newCelestial()
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }
  cGET() {
    this.systemAPI.getCelestial("5b627404511a0716ac767f08")
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }
  cPUT() {
  }
  cDELETE() {
    this.systemAPI.deleteCelestial("5b627404511a0716ac767f08")
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

}
