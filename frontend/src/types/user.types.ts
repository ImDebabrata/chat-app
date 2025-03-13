export interface LoggedInUserInterface {
    user: {
      id: string;
      email: string;
      name: string;
      status?: string;
    };
    token: string;
  }