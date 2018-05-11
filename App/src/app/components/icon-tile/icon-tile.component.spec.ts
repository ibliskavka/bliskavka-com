import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconTileComponent } from './icon-tile.component';

describe('IconTileComponent', () => {
  let component: IconTileComponent;
  let fixture: ComponentFixture<IconTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
