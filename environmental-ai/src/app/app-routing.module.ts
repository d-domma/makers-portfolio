import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BotComponent } from './bot/bot.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';  // Import LoginComponent
import { SignUpComponent } from './signup/signup.component';
import { LogoutComponent } from './logout/logout.component';  // Import LogoutComponent


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'bot', component: BotComponent },
  { path: 'login', component: LoginComponent },  // Add route for Login
  { path: 'signup', component: SignUpComponent },
  { path: 'logout', component: LogoutComponent },  // Add logout route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
