import { Post } from '@nestjs/common'
import { Body } from '@nestjs/common'
import { Controller } from '@nestjs/common'
import { UserDTO } from 'src/user/user.dto'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'

@Controller()
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  @Post('login')
  login(@Body() data: Pick<UserDTO, 'userName' | 'password'>) {
    return this.authService.login(data)
  }

  @Post('register')
  register(@Body() data: UserDTO) {
    return this.authService.register(data)
  }
}
