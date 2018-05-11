import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { IconTileComponent } from './components/icon-tile/icon-tile.component';
import { PageHomeComponent } from './components/page-home/page-home.component';
import { PagePrivacyComponent } from './components/page-privacy/page-privacy.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { SectionProjectsComponent } from './components/section-projects/section-projects.component';
import { SectionSocialComponent } from './components/section-social/section-social.component';

@NgModule({
  declarations: [
    AppComponent,
    IconTileComponent,
    PageHomeComponent,
    PagePrivacyComponent,
    SectionProjectsComponent,
    SectionSocialComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
