import { Component, signal, OnInit, OnDestroy, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  isProcessing = signal(false);
  isSuccess = signal(false);
  isResending = signal(false);
  isAutoVerifying = signal(false);
  code = signal(['', '', '', '', '', '']);
  countdown = signal(60);
  errorMessage = signal<string | null>(null);
  email = signal<string | null>(null);

  private countdownTimer: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.startCountdown();

    this.route.queryParams.subscribe(params => {
      this.email.set(params['email'] || null);
      
      // Check for an automatically prefilled code (if coming from a link)
      const codeParam = params['code'];
      if (codeParam && typeof codeParam === 'string' && codeParam.length === 6) {
        this.code.set(codeParam.split(''));
        this.isAutoVerifying.set(true);
        this.verify();
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
    const emailStr = this.email();
    if (!emailStr) {
      this.errorMessage.set("Email not found. Please try registering again.");
      return;
    }

    this.isResending.set(true);
    this.errorMessage.set(null);

    this.authService.resendCode(emailStr).subscribe({
      next: (res) => {
        this.isResending.set(false);
        this.startCountdown();
        // Maybe show a success toast?
      },
      error: (err) => {
        this.isResending.set(false);
        this.errorMessage.set(err.error?.message || "Failed to resend code.");
      }
    });
  }

  verify() {
    const fullCode = this.code().join('');
    const emailStr = this.email();
    
    if(fullCode.length === 6 && emailStr) {
       this.isProcessing.set(true);
       this.errorMessage.set(null);

       this.authService.verifyEmail(emailStr, fullCode).subscribe({
         next: (res) => {
           this.isProcessing.set(false);
           if (res.success || res.boolean) {
             this.isSuccess.set(true);
           } else {
             this.errorMessage.set(res.message || "Verification failed.");
           }
         },
         error: (err) => {
           this.isProcessing.set(false);
           this.errorMessage.set(err.error?.message || "Invalid or expired code.");
         }
       });
    }
  }

  ngOnDestroy() {
     if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
}
