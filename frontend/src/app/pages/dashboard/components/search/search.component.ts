import { Component, signal, inject } from '@angular/core';
import { PatientsService } from '../../../../core/services/patients.service';
import { Patient } from '../../../../core/models/api.models';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})

export class SearchComponent {
  showModal = signal(false);
  searchQuery = signal('');
  searchResults = signal<Patient[]>([]);
  searchLoading = signal(false);
  searchError = signal<string | null>(null);
  private readonly patientsService = inject(PatientsService);
  private readonly searchInput$ = new Subject<string>();

  constructor() {
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim()) {
            this.searchLoading.set(false);
            this.searchResults.set([]);
            return this.patientsService.searchPatients('');
          }
          this.searchLoading.set(true);
          this.searchError.set(null);
          return this.patientsService.searchPatients(query.trim());
        })
      )
      .subscribe({
        next: (results: Patient[]) => {
          this.searchResults.set(results || []);
          this.searchLoading.set(false);
        },
        error: (err) => {
          this.searchError.set(err.message || 'Error buscando pacientes');
          this.searchResults.set([]);
          this.searchLoading.set(false);
        },
      });
  }

  openModal() {
    this.showModal.set(true);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.searchError.set(null);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchInput$.next(value);
  }
}
