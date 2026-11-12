export * from './authentication.service';
import { AuthenticationService } from './authentication.service';
export * from './health.service';
import { HealthService } from './health.service';
export * from './users.service';
import { UsersService } from './users.service';
export const APIS = [AuthenticationService, HealthService, UsersService];
