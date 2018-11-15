import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSettingComponent } from './search-setting.component';

describe('SearchSettingComponent', () => {
  let component: SearchSettingComponent;
  let fixture: ComponentFixture<SearchSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
