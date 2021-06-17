import { HttpService, Injectable } from '@nestjs/common'
import { objectToQueryString } from 'src/helpers/object-to-query-string.helper'
import {
  getAPIDiscoverUrl,
  getAPIReqCategoryUrl,
} from 'src/helpers/url-for-tmdb-generator.helper'
import { SimpleConsoleLogger } from 'typeorm'
import { FilmCategories } from './film.models'

// Get Popular     https://api.themoviedb.org/3/movie/popular?api_key=<;<api_key>>&language=en-US&page=1
// Get Now Playing https://api.themoviedb.org/3/movie/now_playing?api_key=<;<api_key>>&language=en-US&page=1
// Get Top Rated   https://api.themoviedb.org/3/movie/top_rated?api_key=<;<api_key>>&language=en-US&page=1
//                 https://api.themoviedb.org/3/move/top_rated?api_key=ec184becc0a551d20978c49859863834&page=3&language=ru-RU
// Get Upcoming    https://api.themoviedb.org/3/movie/upcoming?api_key=<;<api_key>>&language=en-US&page=1
// Movie Discover  https://api.themoviedb.org/3/discover/movie?api_key=<;<api_key>>&language=en-US&page=1&sort_by=popularity.desc&include_adult=false&include_video=false&with_watch_monetization_types=flatrate

const category = 'discover/movie'
const pageNumber = 1
const filter = '&with_genres=28'
const apiKey = 'ec184becc0a551d20978c49859863834'
const language = 'ru-RU'
const apiReqUrl = `${process.env.API_BASE_URL}/${category}?page=${pageNumber}${filter}&api_key=${apiKey}&language=${language}`

@Injectable()
export class FilmService {
  constructor(private httpService: HttpService) {}

  async getFilmsByCategory(
    pageNumbers: string,
    filmCategory: FilmCategories
  ): Promise<string[]> {
    const pageNumbersArr = pageNumbers.split(',')
    console.log('getFilmsByCategory: ', pageNumbers, filmCategory)
    const requestsArr = pageNumbersArr.map((page) => {
      return this.httpService
        .get(
          getAPIReqCategoryUrl(
            process.env.API_BASE_URL,
            process.env.API_KEY,
            filmCategory,
            page as unknown as number,
            'ru-RU'
          )
        )
        .toPromise()
    })

    const allRequests = await Promise.all(requestsArr)

    return allRequests.flatMap((x) => x.data.results.map((movie) => movie.id))
  }

  async getFilmsByFilters(pageNumbers: string, filterParams: object) {
    console.log('getFilmsByFilters: ', pageNumbers, filterParams)
    const pageNumbersArr = pageNumbers.split(',')

    const requestsArr = pageNumbersArr.map((page) => {
      return this.httpService
        .get(
          getAPIDiscoverUrl(
            process.env.API_BASE_URL,
            process.env.API_KEY,
            objectToQueryString(filterParams),
            page as unknown as number,
            'ru-RU'
          )
        )
        .toPromise()
    })

    const allRequests = await Promise.all(requestsArr)

    return allRequests.flatMap((x) => x.data.results.map((movie) => movie.id))
  }
}
