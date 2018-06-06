import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MonitoringService } from '../../monitoring.service';

@Component({
  selector: 'app-page-share',
  templateUrl: './page-share.component.html',
  styleUrls: ['./page-share.component.css']
})
export class PageShareComponent implements OnInit {

  app:string;
  img:string;

  appTitle:string;
  appTagline:string;
  appLink:string;

  imgLink:string;

  constructor(
    private router:Router, 
    private route: ActivatedRoute,
    private monitoring: MonitoringService) {

      this.route.params.subscribe(params => {
        this.app = params.app;
        this.img = params.img;
        this.imgLink = 'https://i.imgur.com/' + this.img;

        switch (this.app) {
          case 'ssg':
            this.appTitle = 'Screen Saver Gallery';
            this.appTagline = '35+ categories of the best photography on the internet!';
            this.appLink = 'https://www.microsoft.com/store/apps/9NBLGGH5J8TX?cid=bliskavka-com';
            break;
          case 'vss':
            this.appTitle = 'Vehicle Screen Savers';
            this.appTagline = '35 categories of the best vehicle photos on the internet!';
            this.appLink = 'https://www.microsoft.com/store/apps/9PNNL64P97L9';
            break;
          default:
            this.router.navigate(['/share/ssg/31dqQSo.jpg']);
        }

        this.monitoring.logPageView('page-share', window.location.href);
        this.monitoring.logEvent('ImageShared', { 'app': this.app, 'img': this.img });
      });
  }

  ngOnInit() {
  }

  openStore(){
    this.monitoring.logEvent('StoreOpened', { 'app': this.app, 'img': this.img });
    window.location.href = this.appLink;
    return false;
  }
}
