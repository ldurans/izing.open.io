declare namespace SocketIO {
  export interface Socket {
    auth: { id: string | number; profile: string; tenantId: string | number };
    user: User;
  }
}
