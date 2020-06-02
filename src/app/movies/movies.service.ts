import { Injectable } from '@angular/core';

import { Movie } from './movies.model';
import MoviesJson from './movies-data.json';
import { BehaviorSubject, Observable, combineLatest, Subject } from 'rxjs';
import { FilterParams } from './filter/filters.model';
import { map, startWith } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  // Main data storage
  private _moviesData$: BehaviorSubject<Movie[]> = new BehaviorSubject<Movie[]>([]);

  // Get changes in filter/sort/paging
  private filterTouched$ = new Subject<void>();

  // State of filter params
  private filterParams: FilterParams = {
    name: '',
    genre: '',
    premiere: ''
  };

  // State of sorting params
  private sortParams: [string, string];

  // TODO: UI for number of movies. Temporary hardcoded.
  private offsetPage = 15;
  // State of loaded pages. Will be reseted after filtering/sorting.
  private currentPage = 1;
  // Public represent of data storage
  public movies$ = this._moviesData$.asObservable();

  constructor() {
    // Init movies data storage
    this._moviesData$.next(MoviesJson);
  }

  getMovies$(): Observable<Movie[]> {
    // Init with empty filter params
    const filter$ = this.filterTouched$.pipe(startWith(this.filterParams));
    // Combine all stored movies with triggered filters
    return combineLatest([this.movies$, filter$])
      .pipe(map(([movies]) => {
        let filteredMovies = movies;
        // Filtered by search name
        if (this.filterParams.name) {
          filteredMovies = movies.filter(movie => {
            return movie.name.toLowerCase().includes(this.filterParams.name.toLowerCase());
          });
        }
        // Filtered by genre
        if (this.filterParams.genre) {
          filteredMovies = filteredMovies.filter(movie => {
            return movie.genres.indexOf(this.filterParams.genre) !== -1;
          });
        }
        // Filtered by premiere
        if (this.filterParams.premiere) {
          filteredMovies = filteredMovies.filter(movie => {
            return movie.premiere.includes(this.filterParams.premiere);
          });
        }
        // Job after filtering in case it still has movies
        if (filteredMovies.length > 0 && this.sortParams) {
          filteredMovies.sort(this.sortBy(this.sortParams[0], this.sortParams[1] === 'down'));
        }
        // Infinitive paging
        return filteredMovies.slice(0, this.currentPage * this.offsetPage);
      }));
  }

  updateFilterParams(name: string, value: string) {
    this.filterParams[name] = value;
    this.currentPage = 1;
    this.filterTouched$.next();
  }

  sortMovies(name: string, direction: string) {
    this.sortParams = [name, direction];
    this.currentPage = 1;
    this.filterTouched$.next();
  }

  loadMoreMovies() {
    this.currentPage++;
    this.filterTouched$.next();
  }

  private sortBy(field: string, reverse: boolean) {
    const sortOrder = !reverse ? 1 : -1;
    return (a, b) => {
      if (isNaN(a[field].slice(-4))) {
        return b[field].localeCompare(a[field]) * sortOrder;
      } else {
        return (b[field].split('.').reverse().join('') - a[field].split('.').reverse().join('')) * sortOrder;
      }
    };
  }
}
