import { Component } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  fullName = '';
  email = '';
  subject = 'General Inquiry';
  message = '';
  sending = false;

  constructor(private readonly api: ApiService) {}

  async onSend(): Promise<void> {
    if (!this.fullName.trim() || !this.email.trim() || !this.message.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    this.sending = true;
    try {
      const res = await this.api
        .sendContactMessage({
          fullName: this.fullName.trim(),
          email: this.email.trim(),
          subject: this.subject,
          message: this.message.trim(),
        })
        .toPromise();
      alert(res?.message ?? 'Message sent!');
      this.fullName = '';
      this.email = '';
      this.subject = 'General Inquiry';
      this.message = '';
    } catch (e) {
      console.error(e);
      alert('Failed to send message. Please try again.');
    } finally {
      this.sending = false;
    }
  }
}
