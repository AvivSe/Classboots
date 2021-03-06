import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from "@angular/router";
import {AuthService} from "./auth.service";
import {Injectable} from "@angular/core";

@Injectable()
export class AdminGuardService implements CanActivate, CanActivateChild {
    constructor(private authService: AuthService, private router: Router) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        if (this.authService.isLogged() && this.authService.getIsAdmin()) {
            return true;
        }
        this.authService.setRedirectUrl(url);
        this.router.navigate([ 'PermissionDenied' ]);
        return false;
    }
    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.authService.isLogged();
        //let loggedInUser= this.authService.getLoggedInUser();
        //if (loggedInUser.role === 'ADMIN') {
        //    return true;
        // } else {
        //   return false;
        // }
    }
}