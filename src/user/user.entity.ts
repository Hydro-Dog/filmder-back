import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import * as bcrypt from 'bcrypt'
import { UserRO } from './user.dto'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string

  @CreateDateColumn()
  created: Date

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({
    unique: true,
  })
  email: string

  @Column({
    unique: true,
  })
  userName: string

  @Column()
  password: string

  @Column({ nullable: true })
  token: string

  @Column('text', { array: true, nullable: true })
  activeSessions: string[]

  @Column('text', { array: true, nullable: true })
  sessionsInvite: string[]

  @Column('text', { array: true, nullable: true })
  favoriteFilms: string[]

  @Column('text', { array: true, nullable: true })
  sessionHistory: string[]

  @Column()
  emailConfirmed: boolean

  // @BeforeInsert()
  // async hashPassword() {
  //   this.password = await bcrypt.hash(this.password, 10)
  // }

  sanitizeUser(hideToken = true): UserRO {
    const { id, created, firstName, lastName, email, userName, token } = this
    const responseObject: UserRO = {
      id,
      created,
      firstName,
      lastName,
      email,
      userName,
    }
    if (!hideToken) {
      responseObject.token = token
    }
    return responseObject
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password)
  }
}
