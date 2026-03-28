import { Component, signal, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit, OnDestroy {
  isProcessing = signal(false);
  isSuccess = signal(false);
  isResending = signal(false);
  code = signal(['', '', '', '', '', '']);
  countdown = signal(60);
  private countdownTimer: any;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.startCountdown();

    // Check for "code" query parameter from an email verification button
    this.route.queryParams.subscribe(params => {
      const codeParam = params['code'];
      if (codeParam && typeof codeParam === 'string' && codeParam.length === 6) {
        // Prefill the 6 empty boxes dynamically
        this.code.set(codeParam.split(''));
        
        // Let the UI render the codes gracefully before blasting the simulation lock
        setTimeout(() => {
           this.verify();
        }, 500);
      }
    });
  }

  startCountdown() {
    this.countdown.set(60);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    
    if (isPlatformBrowser(this.platformId)) {
      this.countdownTimer = setInterval(() => {
        const current = this.countdown();
        if (current > 0) {
          this.countdown.set(current - 1);
        } else {
          clearInterval(this.countdownTimer);
        }
      }, 1000);
    }
  }

  onInput(event: any, index: number) {
     const value = event.target.value;
     if(value.length > 0) {
        let newCode = [...this.code()];
        newCode[index] = value.substring(value.length - 1);
        this.code.set(newCode);

        if(index < 5 && value) {
           const nextInput = document.getElementById(`code-${index + 1}`);
           if(nextInput) nextInput.focus();
        }
     }
  }

  onKeyDown(event: any, index: number) {
     if(event.key === 'Backspace') {
       let newCode = [...this.code()];
       if(!newCode[index] && index > 0) {
          const prevInput = document.getElementById(`code-${index - 1}`);
          if(prevInput) {
            prevInput.focus();
            newCode[index - 1] = '';
          }
       } else {
          newCode[index] = '';
       }
       this.code.set(newCode);
     }
  }

  pasteCode(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').trim() || '';
    if(pastedData.length > 0) {
       const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
       let newCode = ['', '', '', '', '', ''];
       digits.forEach((digit, i) => { newCode[i] = digit; });
       this.code.set(newCode);

       const targetIndex = Math.min(digits.length, 5);
       const targetInput = document.getElementById(`code-${targetIndex === 6 ? 5 : targetIndex}`);
       if(targetInput) targetInput.focus();
    }
  }

  resendCode() {
     this.isResending.set(true);
     setTimeout(() => {
        this.isResending.set(false);
        this.startCountdown();
     }, 1500);
  }

  verify() {
    const fullCode = this.code().join('');
    if(fullCode.length === 6) {
       this.isProcessing.set(true);
       setTimeout(() => {
          this.isProcessing.set(false);
          this.isSuccess.set(true);
       }, 2000);
    }
  }

  ngOnDestroy() {
     if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
}
