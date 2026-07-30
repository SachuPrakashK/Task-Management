import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentNode } from './comment-node';

describe('CommentNode', () => {
  let component: CommentNode;
  let fixture: ComponentFixture<CommentNode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentNode],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentNode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
