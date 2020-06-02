import { Component, OnInit, OnDestroy } from '@angular/core';
import { MoviesService } from './movies.service';
import { Movie } from './movies.model';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements OnInit, OnDestroy {

  // Local represent of Movies
  movies: Movie[] = [];
  // Sort state
  sortBy: string;
  sortDir: 'up' | 'down';

  private toDestroy = false;

  constructor(private movieService: MoviesService) { }

  ngOnInit(): void {
    // Get subscription to Movies
    this.movieService.getMovies$()
      .pipe(
        takeWhile(() => !this.toDestroy)
      ).subscribe(items => this.movies = items);
  }

  // Styling header selected to sort
  getSortBy(movieProp: string) {
    if (this.sortBy === movieProp) {
      return this.sortDir;
    }
    return false;
  }

  // Sort action
  sort(movieProp: string) {
    if (this.sortBy === movieProp) {
      this.sortDir = this.sortDir === 'up' ? 'down' : 'up';
    } else {
      this.sortBy = movieProp;
      this.sortDir = 'up';
    }

    this.movieService.sortMovies(this.sortBy, this.sortDir);
  }

  // Infinitive scroll
  onScroll() {
    this.movieService.loadMoreMovies();
  }

  ngOnDestroy() {
    this.toDestroy = true;
  }

}
