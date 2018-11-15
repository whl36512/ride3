import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThistlistComponent } from './thistlist.component';

describe('ThistlistComponent', () => {
  let component: ThistlistComponent;
  let fixture: ComponentFixture<ThistlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThistlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThistlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
