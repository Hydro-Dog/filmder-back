import { Logger, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppGetaway } from 'src/app-getaway/app-getaway'
import { MatchSession } from 'src/entity/match-session.entity'
import { User } from 'src/entity/user.entity'
import { FilmModule } from 'src/film/film.module'
import { UserModule } from 'src/user/user.module'
import { MatchSessionController } from './match-session.controller'
import { MatchSessionService } from './match-session.service'

@Module({
  imports: [
    FilmModule,
    UserModule,
    TypeOrmModule.forFeature([MatchSession, User]),
    JwtModule.register({}),
  ],
  controllers: [MatchSessionController],
  providers: [MatchSessionService, AppGetaway, Logger],
})
export class MatchSessionModule {}
