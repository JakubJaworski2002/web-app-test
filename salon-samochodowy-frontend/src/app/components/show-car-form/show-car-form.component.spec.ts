import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCarFormComponent } from './show-car-form.component';

describe('ShowCarFormComponent', () => {
  let component: ShowCarFormComponent;
  let fixture: ComponentFixture<ShowCarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCarFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowCarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
