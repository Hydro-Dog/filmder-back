import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { FilmService } from 'src/film/film.service'
import {
  CreateMatchSessionDTO,
  UpdateMatchSessionStatusDTO,
} from './match-session.dto'
import {
  MatchSessionEntity,
  MatchSessionStatus,
} from 'src/entity/match-session.entity'
import { UserEntity } from 'src/entity/user.entity'

const INITIAL_PAGES = '1'
const FILMS_PAGE_SIZE = 20

@Injectable()
export class MatchSessionService {
  constructor(
    // private appGetaway: AppGetaway,
    @InjectRepository(MatchSessionEntity)
    private matchSessionRepository: Repository<MatchSessionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private filmService: FilmService
  ) {}

  async create(data: CreateMatchSessionDTO) {
    const filmsSequence = await this.filmService.getFilmsByCategory(
      INITIAL_PAGES,
      data.category
    )

    const host = await this.userRepository.findOne({
      where: { id: data.hostId },
    })
    const guest = await this.userRepository.findOne({
      where: { id: data.guestId },
    })

    const matchSessionData = await this.matchSessionRepository.create(
      new MatchSessionEntity({
        host: new UserEntity(host),
        guest: new UserEntity(guest),
        filmsSequence,
        category: data.category,
        matchLimit: data.matchLimit,
        status: MatchSessionStatus.Pending,
      })
    )

    const matchSessionSaved = await this.matchSessionRepository.save(
      matchSessionData
    )

    guest.invitedToMatchesUUIDs.push(matchSessionSaved.id)
    host.hostedMatchesUUIDs.push(matchSessionSaved.id)

    await this.userRepository.update({ id: host.id }, { ...host })
    await this.userRepository.update({ id: guest.id }, { ...guest })

    // this.appGetaway.emitToClient(
    //   guest.id.toString(),
    //   MatchSessionSocketEvents.ServerMessage,
    //   {
    //     payload: matchSession,
    //     event: MatchSessionChangesEvents.Add,
    //   }
    // )

    // this.appGetaway.emitToClient(
    //   host.id.toString(),
    //   MatchSessionSocketEvents.ServerMessage,
    //   {
    //     payload: matchSession,
    //     event: MatchSessionChangesEvents.Add,
    //   }
    // )

    return matchSessionData
  }

  async deleteMatchSession(matchSessionId: number, userId: number) {
    const matchSession = await this.matchSessionRepository
      .createQueryBuilder('match_session')
      .select([
        'match_session',
        'guest.id',
        'guest.userName',
        'host.id',
        'host.userName',
      ])
      .leftJoin('match_session.guest', 'guest')
      .leftJoin('match_session.host', 'host')
      .where('match_session.id = :id', { id: matchSessionId })
      .getOne()

    if (+matchSession?.guest?.id === +userId) {
      matchSession.guest = null
    } else if (+matchSession?.host?.id === +userId) {
      matchSession.host = null
    }

    // await this.matchSessionRepository.update(
    //   { id: matchSessionId },
    //   { ...matchSession }
    // )

    // if (!matchSession.host && !matchSession.guest) {
    //   await this.matchSessionRepository.delete({ id: matchSessionId })
    // }

    return matchSessionId
  }

  async updateStatus(data: UpdateMatchSessionStatusDTO) {
    return await this.matchSessionRepository.save({
      id: data.matchSessionId,
      status: data.status,
    })
  }

  decline() {}

  continue() {}

  leave() {}

  async getMatchSessionByUserId(id: any) {
    return await this.matchSessionRepository
      .createQueryBuilder('match_session')
      .select([
        'match_session',
        'guest.id',
        'guest.username',
        'host.id',
        'host.username',
      ])
      .leftJoin('match_session.guest', 'guest')
      .leftJoin('match_session.host', 'host')
      .where('match_session.guest.id = :id', { id })
      .orWhere('match_session.host.id = :id', { id })
      .getMany()
  }

  async getMatchSessionById(matchSessionId: any) {
    return await this.matchSessionRepository
      .createQueryBuilder('match_session')
      .select([
        'match_session',
        'guest.id',
        'guest.userName',
        'host.id',
        'host.userName',
      ])
      .leftJoin('match_session.guest', 'guest')
      .leftJoin('match_session.host', 'host')
      .where('match_session.id = :id', { id: matchSessionId })
      .getOne()
  }

  // async update(id: number, matchSessionNew: MatchSession) {
  //   //TODO: убрать это удаление когда добавим список отклоненных матчей
  //   if (matchSessionNew.declined) {
  //     await this.matchSessionRepository.delete({ id: matchSessionNew.id })
  //     const guest = await this.userRepository.findOne({
  //       where: { id: matchSessionNew.guest.id },
  //     })
  //     await this.userRepository.update(
  //       { id: guest.id },
  //       {
  //         ...guest,
  //         sessionsInvite: guest.sessionsInvite.filter(
  //           (id) => id.toString() !== matchSessionNew.id.toString()
  //         ),
  //       }
  //     )

  //     this.appGetaway.emitToClient(
  //       matchSessionNew.host.id.toString(),
  //       MatchSessionSocketEvents.ServerMessage,
  //       {
  //         payload: matchSessionNew,
  //         event: MatchSessionChangesEvents.ChangeStatus,
  //       }
  //     )

  //     this.appGetaway.emitToClient(
  //       matchSessionNew.guest.id.toString(),
  //       MatchSessionSocketEvents.ServerMessage,
  //       {
  //         payload: matchSessionNew,
  //         event: MatchSessionChangesEvents.ChangeStatus,
  //       }
  //     )

  //     return matchSessionNew
  //   }
  //   const matchSessionCurrent = await this.matchSessionRepository.findOne({
  //     where: { id },
  //   })

  //   await this.matchSessionRepository.update({ id }, { ...matchSessionNew })

  //   if (matchSessionCurrent.accepted === false && matchSessionNew.accepted) {
  //     const guest = await this.userRepository.findOne({
  //       where: { id: matchSessionNew.guest.id },
  //     })

  //     await this.userRepository.update(
  //       { id: guest.id },
  //       {
  //         ...guest,
  //         currentMatchSession: matchSessionNew.id,
  //         sessionsInvite: guest.sessionsInvite.filter(
  //           (id) => id.toString() !== matchSessionNew.id.toString()
  //         ),
  //       }
  //     )
  //   }

  //   const updateMatchSession = await this.matchSessionRepository
  //     .createQueryBuilder('match_session')
  //     .select([
  //       'match_session',
  //       'guest.id',
  //       'guest.userName',
  //       'host.id',
  //       'host.userName',
  //     ])
  //     .leftJoin('match_session.guest', 'guest')
  //     .leftJoin('match_session.host', 'host')
  //     .where('match_session.id = :id', { id: matchSessionNew.id })
  //     .getOne()

  //   this.appGetaway.emitToClient(
  //     matchSessionNew.host.id.toString(),
  //     MatchSessionSocketEvents.ServerMessage,
  //     {
  //       payload: matchSessionNew,
  //       event: MatchSessionChangesEvents.ChangeStatus,
  //     }
  //   )

  //   this.appGetaway.emitToClient(
  //     matchSessionNew.guest.id.toString(),
  //     MatchSessionSocketEvents.ServerMessage,
  //     {
  //       payload: matchSessionNew,
  //       event: MatchSessionChangesEvents.ChangeStatus,
  //     }
  //   )

  //   return updateMatchSession
  // }

  // async swipe(
  //   matchSessionId: number,
  //   filmJSON: string,
  //   userId: number,
  //   swipeDirection: 'left' | 'right'
  // ) {
  //   const film = JSON.parse(filmJSON)
  //   const currentMatchSession = await this.matchSessionRepository
  //     .createQueryBuilder('match_session')
  //     .select([
  //       'match_session',
  //       'guest.id',
  //       'guest.userName',
  //       'guest.currentMatchSession',
  //       'host.id',
  //       'host.userName',
  //       'host.currentMatchSession',
  //     ])
  //     .leftJoin('match_session.guest', 'guest')
  //     .leftJoin('match_session.host', 'host')
  //     .where('match_session.id = :id', { id: matchSessionId })
  //     .getOne()

  //   let isMatched = false
  //   if (userId === +currentMatchSession.host.id && swipeDirection === 'right') {
  //     //if film was liked by user, push new id to liked films array
  //     currentMatchSession.hostLikedFilms.push(film.id.toString())
  //     //check for matches isMatched: true?
  //     isMatched = currentMatchSession.guestLikedFilms.includes(
  //       film.id.toString()
  //     )
  //   } else if (
  //     userId == +currentMatchSession.guest.id &&
  //     swipeDirection === 'right'
  //   ) {
  //     currentMatchSession.guestLikedFilms.push(film.id.toString())
  //     isMatched = currentMatchSession.hostLikedFilms.includes(
  //       film.id.toString()
  //     )
  //   }

  //   if (isMatched) {
  //     //update matchedFilms array
  //     currentMatchSession.matchedMoviesJSON.push(filmJSON)
  //     const filmIndex =
  //       userId === +currentMatchSession.host.id
  //         ? currentMatchSession.hostCurrentFilmIndex
  //         : currentMatchSession.guestCurrentFilmIndex

  //     //send notifications to both users if the are in current match
  //     if (
  //       +currentMatchSession.id ===
  //       +currentMatchSession.guest.currentMatchSession
  //     ) {
  //       this.appGetaway.emitToClient(
  //         currentMatchSession.guest.id.toString(),
  //         MatchSessionSocketEvents.ServerMessage,
  //         {
  //           event: MatchSessionChangesEvents.FilmsMatch,
  //           payload: {
  //             filmJSON: currentMatchSession.filmsSequenceJson[filmIndex],
  //             source:
  //               userId.toString() === currentMatchSession.guest.id.toString()
  //                 ? 'self'
  //                 : 'opponent',
  //           },
  //         }
  //       )
  //     }

  //     if (
  //       +currentMatchSession.id ===
  //       +currentMatchSession.host.currentMatchSession
  //     ) {
  //       this.appGetaway.emitToClient(
  //         currentMatchSession.host.id.toString(),
  //         MatchSessionSocketEvents.ServerMessage,
  //         {
  //           event: MatchSessionChangesEvents.FilmsMatch,
  //           payload: {
  //             filmJSON: currentMatchSession.filmsSequenceJson[filmIndex],
  //             source:
  //               userId.toString() === currentMatchSession.host.id.toString()
  //                 ? 'self'
  //                 : 'opponent',
  //           },
  //         }
  //       )
  //     }
  //   }

  //   //increment users CurrentFilmIndex
  //   if (userId === +currentMatchSession.host.id) {
  //     currentMatchSession.hostCurrentFilmIndex++
  //   } else {
  //     currentMatchSession.guestCurrentFilmIndex++
  //   }

  //   let completed =
  //     currentMatchSession.matchedMoviesJSON.length >=
  //     currentMatchSession.matchLimit

  //   const lastFilmIndex = currentMatchSession.filmsSequenceJson.length - 1
  //   if (
  //     currentMatchSession.hostCurrentFilmIndex >= lastFilmIndex ||
  //     currentMatchSession.guestCurrentFilmIndex >= lastFilmIndex
  //   ) {
  //     const currentPage =
  //       currentMatchSession.filmsSequenceJson.length / FILMS_PAGE_SIZE
  //     const filmsSequence = await this.filmService.getFilmsByCategory(
  //       (currentPage + 1).toString(),
  //       currentMatchSession.category as FilmCategories
  //     )

  //     currentMatchSession.filmsSequenceJson = [
  //       ...currentMatchSession.filmsSequenceJson,
  //       ...filmsSequence.map((filmObj) => JSON.stringify(filmObj)),
  //     ]
  //   }

  //   return await this.matchSessionRepository.save({
  //     ...currentMatchSession,
  //     completed,
  //   })
  // }
}
