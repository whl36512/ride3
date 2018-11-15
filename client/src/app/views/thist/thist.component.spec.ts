import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThistComponent } from './thist.component';

describe('ThistComponent', () => {
  let component: ThistComponent;
  let fixture: ComponentFixture<ThistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
