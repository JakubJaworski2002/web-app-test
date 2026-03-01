import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateLeasingComponent } from './calculate-leasing.component';

describe('CalculateLeasingComponent', () => {
  let component: CalculateLeasingComponent;
  let fixture: ComponentFixture<CalculateLeasingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculateLeasingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculateLeasingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
