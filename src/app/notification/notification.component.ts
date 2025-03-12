// notification.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationBuilder, AnimationFactory, AnimationPlayer, animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
   templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent implements OnInit {
  @Input() type: 'default' | 'info' | 'success' | 'warning' | 'error' = 'default';
  @Input() msg: string = '';
  @Input() title?: string;
  @Input() icon?: string;
  @Input() img?: string;
  @Input() size?: 'default' | 'mini' = 'default';
  @Input() rounded: boolean = false;
  @Input() delayIndicator: boolean = true;
  @Input() pauseDelayOnHover: boolean = true;
  @Input() continueDelayOnInactiveTab: boolean = false;
  @Input() position: 'top left' | 'top right' | 'bottom left' | 'bottom right' | 'center top' = 'top right';
  @Input() delay: number = 5000; // 5 seconds by default
  @Input() showClass?: string;
  @Input() hideClass?: string;
  @Input() width?: number;
  
  visible: boolean = true;
  private timeout?: number;
  private player?: AnimationPlayer;
  private builder = inject(AnimationBuilder);
  
  ngOnInit(): void {
    this.show();
    this.startTimer();
  }
  
  show(): void {
    this.visible = true;
    
    if (this.showClass) {
      const factory = this.createAnimationFactory(this.showClass, '0.5s');
      this.player = factory.create(document.querySelector('app-notification') as Element);
      this.player.play();
    }
  }
  
  close(): void {
    if (this.hideClass) {
      const factory = this.createAnimationFactory(this.hideClass, '0.5s');
      this.player = factory.create(document.querySelector('app-notification') as Element);
      this.player.onDone(() => {
        this.visible = false;
      });
      this.player.play();
    } else {
      this.visible = false;
    }
    
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
  
  private startTimer(): void {
    if (this.delay && this.delay > 0) {
      this.timeout = window.setTimeout(() => {
        this.close();
      }, this.delay);
    }
  }
  
  getNotificationClass(): string {
    return `notification-${this.type}`;
  }
  
  getPositionStyle(): { top?: string, bottom?: string, left?: string, right?: string, transform?: string } {
    const style: { top?: string, bottom?: string, left?: string, right?: string, transform?: string } = {};
    
    if (this.position.includes('top')) {
      style.top = '20px';
    } else if (this.position.includes('bottom')) {
      style.bottom = '20px';
    }
    
    if (this.position.includes('left')) {
      style.left = '20px';
    } else if (this.position.includes('right')) {
      style.right = '20px';
    } else if (this.position.includes('center')) {
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    }
    
    return style;
  }
  
  private createAnimationFactory(animationName: string, duration: string): AnimationFactory {
    // Map animation names to actual animation definitions
    const animations: {[key: string]: any} = {
      'fadeInDown': [style({ opacity: 0, transform: 'translateY(-30px)' }), animate(duration, style({ opacity: 1, transform: 'translateY(0)' }))],
      'fadeOutDown': [style({ opacity: 1, transform: 'translateY(0)' }), animate(duration, style({ opacity: 0, transform: 'translateY(30px)' }))],
      'bounceIn': [style({ opacity: 0, transform: 'scale(0.3)' }), animate(duration, style({ opacity: 1, transform: 'scale(1)' }))],
      'bounceOut': [style({ opacity: 1, transform: 'scale(1)' }), animate(duration, style({ opacity: 0, transform: 'scale(0.3)' }))],
      'zoomIn': [style({ opacity: 0, transform: 'scale(0.5)' }), animate(duration, style({ opacity: 1, transform: 'scale(1)' }))],
      'zoomOut': [style({ opacity: 1, transform: 'scale(1)' }), animate(duration, style({ opacity: 0, transform: 'scale(0.5)' }))],
      'lightSpeedIn': [style({ opacity: 0, transform: 'translateX(100%) skewX(-30deg)' }), animate(duration, style({ opacity: 1, transform: 'translateX(0) skewX(0)' }))],
      'lightSpeedOut': [style({ opacity: 1, transform: 'translateX(0) skewX(0)' }), animate(duration, style({ opacity: 0, transform: 'translateX(100%) skewX(30deg)' }))],
      'rollIn': [style({ opacity: 0, transform: 'translateX(-100%) rotate(-120deg)' }), animate(duration, style({ opacity: 1, transform: 'translateX(0) rotate(0)' }))],
      'rollOut': [style({ opacity: 1, transform: 'translateX(0) rotate(0)' }), animate(duration, style({ opacity: 0, transform: 'translateX(100%) rotate(120deg)' }))]
    };
    
    return this.builder.build(animations[animationName] || []);
  }
}