import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class VkontakteAuthGuard extends AuthGuard('vkontakte') {}
