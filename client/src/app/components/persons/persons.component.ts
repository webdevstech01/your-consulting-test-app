import { Component, OnInit, OnDestroy } from '@angular/core';
import axios from 'axios';
import { ToastrService } from 'ngx-toastr';
import { faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { SET_HEIGHT } from 'src/app/utils/utils-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PersonModalComponent } from './person-modal/person-modal.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

interface Person {
  id: number;
  lastName: string;
  firstName: string;
  cnp: string;
  age: number;
  cars: OwnedCar[];
}

interface OwnedCar {
  id: number;
  brand: string;
  model: string;
  manufactureYear: number;
  engineCapacity: number;
  tax: number;
}

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
})
export class PersonsComponent implements OnInit, OnDestroy {
  persons: Person[] = [];

  filters = {
    lastName: '',
    firstName: '',
    cnp: '',
    age: '',
  };

  private filterTimer?: ReturnType<typeof setTimeout>;
  private requestVersion = 0;

  faPlus = faPlus;
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;

  constructor(
    private toastr: ToastrService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    SET_HEIGHT('view', 20, 'height');
    void this.loadPersons();
  }

  ngOnDestroy(): void {
    clearTimeout(this.filterTimer);
    this.requestVersion++;
  }

  onFiltersChange(): void {
    clearTimeout(this.filterTimer);

    this.requestVersion++;

    this.filterTimer = setTimeout(() => {
      void this.loadPersons();
    }, 300);
  }

  async loadPersons(): Promise<void> {
    const version = ++this.requestVersion;

    try {
      const response = await axios.get<Person[]>('/api/persons', {
        params: { ...this.filters },
      });

      if (version !== this.requestVersion) {
        return;
      }

      this.persons = response.data;
    } catch (error) {
      if (version !== this.requestVersion) {
        return;
      }

      console.error('Failed to fetch persons:', error);
      this.toastr.error('Eroare la preluarea persoanelor.');
    }
  }

  deletePerson(person: Person): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.title = 'Ștergere persoană';
    modalRef.componentInstance.content =
      'Doriți să ștergeți persoana selectată?';

    modalRef.closed.subscribe(() => {
      void this.removePerson(person.id);
    });
  }

  async removePerson(id: number): Promise<void> {
    try {
      await axios.delete(`/api/persons/${id}`);
    } catch (error) {
      console.error('Failed to delete person:', error);
      this.toastr.error('Eroare la ștergerea persoanei.');
      return;
    }

    this.toastr.success('Persoana a fost ștearsă.');
    await this.loadPersons();
  }

  addPerson(): void {
    const modalRef = this.modalService.open(PersonModalComponent, {
      size: 'lg',
      backdrop: 'static',
      beforeDismiss: () => !modalRef.componentInstance.saving,
    });

    modalRef.closed.subscribe(() => {
      void this.loadPersons();
    });
  }

  async editPerson(person: Person): Promise<void> {
    let currentPerson: Person;

    try {
      const response = await axios.get<Person>(`/api/persons/${person.id}`);
      currentPerson = response.data;
    } catch (error) {
      console.error('Failed to fetch person:', error);
      this.toastr.error('Eroare la preluarea persoanei.');
      return;
    }

    const modalRef = this.modalService.open(PersonModalComponent, {
      size: 'lg',
      backdrop: 'static',
      beforeDismiss: () => !modalRef.componentInstance.saving,
    });

    modalRef.componentInstance.personToEdit = currentPerson;

    modalRef.closed.subscribe(() => {
      void this.loadPersons();
    });
  }
}
