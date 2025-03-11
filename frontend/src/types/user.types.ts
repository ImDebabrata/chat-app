export interface LoggedInUserInterface {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
  }