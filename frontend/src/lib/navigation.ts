export interface NavigationOptions {
  replace?: boolean;
  state?: any;
}

export class Router {
  static navigate(path: string, options: NavigationOptions = {}) {
    if (typeof window === 'undefined') return;
    
    if (options.replace) {
      window.location.replace(path);
    } else {
      window.location.href = path;
    }
  }

  static back() {
    if (typeof window === 'undefined') return;
    window.history.back();
  }

  static forward() {
    if (typeof window === 'undefined') return;
    window.history.forward();
  }

  static reload() {
    if (typeof window === 'undefined') return;
    window.location.reload();
  }

  static getCurrentPath(): string {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname;
  }

  static isCurrentPath(path: string): boolean {
    return this.getCurrentPath() === path;
  }
}

export const navigate = (path: string, options?: NavigationOptions) => {
  Router.navigate(path, options);
};

export default Router;