import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BotComponent } from './bot/bot.component';
import { LoginComponent } from './login/login.component';  // Import LoginComponent
import { SignUpComponent } from './signup/signup.component';  // Import SignUpComponent

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { 
    path: 'bot', 
    component: BotComponent,
  },
  { path: 'login', component: LoginComponent },  // Add route for Login
  { path: 'signup', component: SignUpComponent },  // Add route for Sign-Up
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
