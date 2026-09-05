import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { ToastrService } from 'ngx-toastr';
import { faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { SET_HEIGHT } from 'src/app/utils/utils-table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PersonModalComponent } from './person-modal/person-modal.component';

interface Person {
  id: number;
  lastName: string;
  firstName: string;
  cnp: string;
  age: number;
}

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
})
export class PersonsComponent implements OnInit {
  persons: Person[] = [];

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

  async loadPersons(): Promise<void> {
    try {
      const response = await axios.get<Person[]>('/api/persons');
      this.persons = response.data;
    } catch (error) {
      console.error('Failed to fetch persons:', error);
      this.toastr.error('Eroare la preluarea persoanelor.');
    }
  }

  addPerson(): void {
    const modalRef = this.modalService.open(PersonModalComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.closed.subscribe((person: Omit<Person, 'id'>) => {
      void this.createPerson(person);
    });
  }

  async createPerson(person: Omit<Person, 'id'>): Promise<void> {
    try {
      await axios.post('/api/persons', person);
    } catch (error) {
      console.error('Failed to create person:', error);
      this.toastr.error('Eroare la salvarea persoanei.');
      return;
    }

    this.toastr.success('Persoana a fost salvată.');
    await this.loadPersons();
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
    });

    modalRef.componentInstance.personToEdit = currentPerson;

    modalRef.closed.subscribe((updatedPerson: Omit<Person, 'id'>) => {
      void this.updatePerson(currentPerson.id, updatedPerson);
    });
  }

  async updatePerson(id: number, person: Omit<Person, 'id'>): Promise<void> {
    try {
      await axios.put(`/api/persons/${id}`, person);
    } catch (error) {
      console.error('Failed to update person:', error);
      this.toastr.error('Eroare la modificarea persoanei.');
      return;
    }

    this.toastr.success('Persoana a fost modificată.');
    await this.loadPersons();
  }
}
