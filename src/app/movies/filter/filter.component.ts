import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, takeWhile } from 'rxjs/operators';
import { MoviesService } from '../movies.service';
import { FilterService } from './filter.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, AfterViewInit, OnDestroy {

  genres: string[];
  years: string[];

  @ViewChild('filterName') filterName: ElementRef;

  private toDestroy = false;

  constructor(private movieService: MoviesService, private filterService: FilterService) { }

  ngOnInit(): void {
    // Get options for filter selects
    this.movieService.movies$
    .pipe(
      takeWhile(() => !this.toDestroy)
    )
    .subscribe(movies => {
      [this.genres, this.years] = this.filterService.getGenresYears(movies);
    });
  }

  ngAfterViewInit() {
    // Work with filter input
    const search$: Observable<Event> = fromEvent<Event>(this.filterName.nativeElement, 'input');
    search$
      .pipe(
        map(event => {
          return (event.target as HTMLInputElement).value;
        }),
        debounceTime(500),
        distinctUntilChanged(),
        takeWhile(() => !this.toDestroy)
      )
      .subscribe(value => {
        this.movieService.updateFilterParams('name', value);
      });

  }

  updateGenre(event: Event) {
    this.movieService.updateFilterParams('genre', (event.target as HTMLSelectElement).value);
  }

  updatePremiere(event: Event) {
    this.movieService.updateFilterParams('premiere', (event.target as HTMLSelectElement).value);
  }

  ngOnDestroy() {
    this.toDestroy = true;
  }
}
