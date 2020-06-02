import { Injectable } from '@angular/core';
import { Movie } from '../movies.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() {}

  // Gathering data for filters (select)
  getGenresYears(movies: Movie[]) {
    const years = [];
    const genres = [];
    movies.forEach(movie => {
      years.push(movie.premiere.slice(-4));
      genres.push(...movie.genres);
    });

    return [
      [...new Set(genres)],
      [...new Set(years)].sort().reverse()
    ];
  }

}
