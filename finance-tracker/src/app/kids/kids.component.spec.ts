import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KidsModeComponent } from './kids-mode.component';

describe('KidsComponent', () => {
  let component: KidsModeComponent;
  let fixture: ComponentFixture<KidsModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KidsModeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KidsModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
