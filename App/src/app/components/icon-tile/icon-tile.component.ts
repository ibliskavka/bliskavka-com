import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-icon-tile',
  templateUrl: './icon-tile.component.html',
  styleUrls: ['./icon-tile.component.css']
})
export class IconTileComponent implements OnInit {

  @Input() text:string;
  @Input() link:string;
  @Input() icon:string;
  @Input() color:string;

  constructor() { }

  ngOnInit() {
  }

  openLink(){
    console.log('link clicked: ', this.link);
    location.href = this.link;
  }
}
