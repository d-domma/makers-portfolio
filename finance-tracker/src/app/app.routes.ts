import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BotComponent } from './bot/bot.component';
import { OrganizerComponent } from './organizer/organizer.component';
import { TrackComponent } from './track/track.component';
import { TrendsComponent } from './trends/trends.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './signup/signup.component';
import { KidsModeComponent } from './kids/kids-mode.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'bot', component: BotComponent },
  { path: 'organizer', component: OrganizerComponent },
  { path: 'track', component: TrackComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'kids', component: KidsModeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
