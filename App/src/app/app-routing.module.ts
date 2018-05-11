import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageHomeComponent } from 'src/app/components/page-home/page-home.component';
import { PagePrivacyComponent } from 'src/app/components/page-privacy/page-privacy.component';

const routes: Routes = [
  {path: '', component: PageHomeComponent},
  {path: 'privacy/:app', component: PagePrivacyComponent}
];

@NgModule({
  exports: [ RouterModule ],
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}