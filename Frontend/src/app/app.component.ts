import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showCookieBanner = false;

  ngOnInit() {
    this.showCookieBanner = localStorage.getItem('cookieConsent') !== 'true';
  }

  acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    this.showCookieBanner = false;
  }
}
