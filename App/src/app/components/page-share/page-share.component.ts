import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-page-share',
  templateUrl: './page-share.component.html',
  styleUrls: ['./page-share.component.css']
})
export class PageShareComponent implements OnInit {

  appTitle:string;
  appTagline:string;
  appLink:string;
  imgLink:string;

  constructor(private router:Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.imgLink = 'https://i.imgur.com/' + params.img;

      switch (params.app) {
        case 'ssg':
          this.appTitle = 'Screen Saver Gallery';
          this.appTagline = '35+ categories of the best photography on the internet!';
          this.appLink = 'https://www.microsoft.com/store/apps/9NBLGGH5J8TX';
          break;
        case 'vss':
          this.appTitle = 'Vehicle Screen Savers';
          this.appTagline = '35 categories of the best vehicle photos on the internet!';
          this.appLink = 'https://www.microsoft.com/store/apps/9PNNL64P97L9';
          break;
        default:
          this.router.navigate(['/share/ssg/31dqQSo.jpg']);
      }
    });
  }

  ngOnInit() {
  }

}
