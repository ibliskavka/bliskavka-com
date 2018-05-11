import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-privacy',
  templateUrl: './page-privacy.component.html',
  styleUrls: ['./page-privacy.component.css']
})
export class PagePrivacyComponent implements OnInit {

  appTitle:string;

  constructor(private router:Router, private route:ActivatedRoute)
  {
    this.route.params.subscribe(params => {
      switch(params.app){
        case 'screen-saver-gallery':
          this.appTitle = 'Screen Saver Gallery';
          break;
        case 'vehicle-screen-savers':
          this.appTitle = 'Vehicle Screen Savers';
          break;
        case 'normal-day-in-russia':
          this.appTitle = 'Normal Day In Russia';
          break;
        case 'piwigo-gallery':
          this.appTitle = 'Piwigo Gallery';
          break;
        default:
          this.appTitle = 'Apps'
      }
    });
  }

  ngOnInit() {
  }

}
