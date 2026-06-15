import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateFundApproval } from './corporate-fund-approval';

describe('CorporateFundApproval', () => {
  let component: CorporateFundApproval;
  let fixture: ComponentFixture<CorporateFundApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorporateFundApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(CorporateFundApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
