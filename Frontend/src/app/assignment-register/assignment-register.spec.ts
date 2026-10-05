import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentRegister } from './assignment-register';

describe('AssignmentRegister', () => {
  let component: AssignmentRegister;
  let fixture: ComponentFixture<AssignmentRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
