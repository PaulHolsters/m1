import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyWrapperComponent } from './body-wrapper.component';

describe('BodyWrapperComponent', () => {
  let component: BodyWrapperComponent;
  let fixture: ComponentFixture<BodyWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
